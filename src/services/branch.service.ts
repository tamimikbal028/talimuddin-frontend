import { getActiveUserId, supabase } from "@/config/supabase";
import { BRANCH_LIMIT, BRANCH_TYPES, MEMBERS_LIMIT } from "@/constants";
import { createApiResponse } from "@/utils/apiResponse";
import {
  buildPagination,
  getBranchAccessContext,
  getOptionalAuthUserId,
  getPaginationParams,
  throwIfError,
} from "@/utils/supabaseHelpers";
import type {
  CreateBranchResponse,
  CreateBranchData,
  MyBranchesResponse,
  BranchDetailsResponse,
  JoinBranchResponse,
  DeleteBranchResponse,
  UpdateBranchResponse,
  UpdateBranchData,
  BranchMembersResponse,
  BaseBranchActionResponse,
  BranchSearchResponse,
  MainBranchesResponse,
  AddBranchMemberData,
  BranchMember,
  UpdateBranchMemberData,
  SearchUsersResponse,
  AddBranchAdminData,
  AddBranchAdminResponse,
  AddBranchModeratorData,
  AddBranchModeratorResponse,
  UpdateBranchModeratorData,
  UpdateBranchModeratorResponse,
  BranchAdminsResponse,
  BranchModeratorsResponse,
  Branch,
  User,
  BranchAdminItem,
  BranchModeratorItem,
  ModeratorAllowedCategory,
} from "../types";

const BRANCH_PUBLIC_COLS =
  "id, name, description, location_name, location_url, admin_info, cover_image, branch_type, parent_branch_id, is_deleted, members_count";

interface RawBranchRow {
  id: string;
  name: string;
  description?: string | null;
  location_name?: string | null;
  location_url?: string | null;
  admin_info?: unknown;
  cover_image: string | null;
  branch_type?: string | null;
  parent_branch_id?: string | null;
  is_deleted?: boolean;
  members_count?: number;
  parent_branch?: { id: string; name: string } | { id: string; name: string }[] | null;
}

const mapBranchRow = (row: RawBranchRow): Branch => {
  const parentRaw = Array.isArray(row.parent_branch)
    ? row.parent_branch[0] || null
    : row.parent_branch || null;

  return {
    id: row.id,
    name: row.name,
    description: row.description || null,
    location_name: row.location_name || null,
    location_url: row.location_url || null,
    admin_info: Array.isArray(row.admin_info) ? row.admin_info : [],
    cover_image: row.cover_image ?? null,
    branch_type:
      row.branch_type === BRANCH_TYPES.SUB
        ? BRANCH_TYPES.SUB
        : BRANCH_TYPES.MAIN,
    parent_branch_id: row.parent_branch_id || null,
    parent_branch: parentRaw
      ? { id: parentRaw.id, name: parentRaw.name }
      : null,
    is_deleted: Boolean(row.is_deleted),
    members_count: row.members_count || 0,
  };
};

interface RawUserJoin {
  id: string;
  full_name: string;
  user_name: string;
  avatar: string | null;
  email?: string;
}

const unwrapSingle = <T>(val: T | T[] | null | undefined): T | null => {
  if (!val) return null;
  return Array.isArray(val) ? val[0] || null : val;
};

const formatBranchMember = (
  row: {
    id: string;
    serial_no?: number | null;
    name?: string | null;
    phone?: string | null;
    address?: string | null;
    blood_group?: string | null;
    email?: string | null;
    note?: string | null;
    is_admin?: boolean;
    is_moderator?: boolean;
    user_id?: string | null;
    created_at: string;
    user?: RawUserJoin | RawUserJoin[] | null;
  },
  requesterId: string,
  canManage: boolean
): BranchMember => {
  const u = unwrapSingle(row.user);
  const isManual = !row.user_id;
  const isSelf = !isManual && u?.id === requesterId;
  const memberName = isManual
    ? row.name || "Unnamed Member"
    : u?.full_name || row.name || "Unnamed";

  const userObj = {
    id: u?.id || null,
    user_name: u?.user_name || null,
    full_name: memberName,
    avatar: u?.avatar || null,
  } as unknown as User;

  return {
    id: row.id,
    serial_no: row.serial_no ?? null,
    name: memberName,
    phone: row.phone ?? null,
    address: row.address ?? null,
    blood_group: row.blood_group ?? null,
    email: isManual ? row.email ?? null : u?.email || row.email || null,
    note: row.note ?? null,
    user: userObj,
    meta: {
      user_relation_status: isSelf ? "SELF" : "NONE",
      member_id: row.id,
      is_admin: Boolean(row.is_admin),
      is_moderator: Boolean(row.is_moderator),
      is_self: isSelf,
      is_manual: isManual,
      can_manage: canManage && !isSelf,
      joined_at: row.created_at,
    },
  };
};

const createBranch = async (
  branchData: CreateBranchData
): Promise<CreateBranchResponse> => {
  const userId = await getActiveUserId();

  const { data: user, error: userErr } = await supabase
    .from("users")
    .select("user_type")
    .eq("id", userId)
    .single();

  if (userErr || !user) {
    throw new Error("User not found");
  }

  if (user.user_type !== "ADMIN") {
    throw new Error("Only admins can create branches");
  }

  const branchType =
    branchData.branch_type === BRANCH_TYPES.SUB
      ? BRANCH_TYPES.SUB
      : BRANCH_TYPES.MAIN;

  let parentBranchId: string | null = null;

  if (branchType === BRANCH_TYPES.SUB) {
    if (!branchData.parent_branch_id) {
      throw new Error("Parent branch is required for sub branch");
    }

    const { data: parentBranch, error: parentErr } = await supabase
      .from("branches")
      .select("id, name, branch_type, is_deleted")
      .eq("id", branchData.parent_branch_id)
      .maybeSingle();

    if (parentErr || !parentBranch || parentBranch.is_deleted) {
      throw new Error("Selected main branch does not exist");
    }

    if (parentBranch.branch_type !== BRANCH_TYPES.MAIN) {
      throw new Error("Parent branch must be a main branch");
    }

    parentBranchId = parentBranch.id;
  }

  const { data: branchRow, error: branchErr } = await supabase
    .from("branches")
    .insert({
      name: branchData.name,
      description: branchData.description?.trim() || null,
      location_name: branchData.location_name?.trim() || null,
      location_url: branchData.location_url?.trim() || null,
      admin_info: Array.isArray(branchData.admin_info)
        ? branchData.admin_info
        : [],
      branch_type: branchType,
      parent_branch_id: parentBranchId,
      is_deleted: false,
      members_count: 0,
    })
    .select(BRANCH_PUBLIC_COLS)
    .single();

  if (branchErr || !branchRow) {
    throw new Error(branchErr?.message || "Failed to create branch");
  }

  return createApiResponse(
    { branch: mapBranchRow(branchRow) },
    "Branch created successfully",
    201
  );
};

const getMainBranches = async (): Promise<MainBranchesResponse> => {
  const { data: branches, error } = await supabase
    .from("branches")
    .select("id, name")
    .eq("branch_type", BRANCH_TYPES.MAIN)
    .eq("is_deleted", false)
    .order("name", { ascending: true });

  throwIfError(error, "Failed to fetch main branches");

  return createApiResponse(
    { branches: branches || [] },
    "Main branches fetched successfully"
  );
};

const getMyBranches = async (page: number): Promise<MyBranchesResponse> => {
  const userId = await getActiveUserId();
  const { page: p, limit, from, to } = getPaginationParams(page, BRANCH_LIMIT);

  const { data: memberships, error, count } = await supabase
    .from("branch_memberships")
    .select(
      `
      branch:branches!inner(
        id, name, cover_image, is_deleted
      )
    `,
      { count: "exact" }
    )
    .eq("user_id", userId)
    .eq("is_deleted", false)
    .eq("branch.is_deleted", false)
    .order("created_at", { ascending: false })
    .range(from, to);

  throwIfError(error, "Failed to fetch my branches");

  const branches = (memberships || [])
    .map((m) => {
      const b = unwrapSingle(
        m.branch as
          | { id: string; name: string; cover_image: string | null }
          | { id: string; name: string; cover_image: string | null }[]
          | null
      );
      if (!b) return null;
      return {
        id: b.id,
        name: b.name,
        cover_image: b.cover_image,
      };
    })
    .filter((b): b is NonNullable<typeof b> => b !== null);

  return createApiResponse(
    {
      branches,
      pagination: buildPagination(p, limit, count ?? 0),
    },
    "My branches fetched successfully"
  );
};

const getAllBranches = async (page: number): Promise<MyBranchesResponse> => {
  const { page: p, limit, from, to } = getPaginationParams(page, BRANCH_LIMIT);

  const { data: branchesData, error, count } = await supabase
    .from("branches")
    .select("id, name, cover_image, is_deleted, branch_type", {
      count: "exact",
    })
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .range(from, to);

  throwIfError(error, "Failed to fetch branches");

  const branches = (branchesData || []).map((branch) => ({
    id: branch.id,
    name: branch.name,
    cover_image: branch.cover_image,
  }));

  return createApiResponse(
    {
      branches,
      pagination: buildPagination(p, limit, count ?? 0),
    },
    "All branches fetched successfully"
  );
};

const getBranchDetails = async (
  branchId: string
): Promise<BranchDetailsResponse> => {
  const userId = await getOptionalAuthUserId();

  const { data: branchRow, error } = await supabase
    .from("branches")
    .select(`${BRANCH_PUBLIC_COLS}, parent_branch:parent_branch_id(id, name)`)
    .eq("id", branchId)
    .maybeSingle();

  if (error || !branchRow) {
    throw new Error("Branch not found");
  }

  if (branchRow.is_deleted) {
    throw new Error("Branch has been deleted");
  }

  let isMember = false;
  let isAdmin = false;
  let isModerator = false;
  let isAppAdmin = false;

  if (userId) {
    const [{ data: membershipData }, { data: userData }] = await Promise.all([
      supabase
        .from("branch_memberships")
        .select("id, is_admin, is_moderator")
        .eq("branch_id", branchId)
        .eq("user_id", userId)
        .eq("is_deleted", false)
        .maybeSingle(),
      supabase
        .from("users")
        .select("user_type")
        .eq("id", userId)
        .maybeSingle(),
    ]);

    isMember = Boolean(membershipData);
    isAdmin = membershipData?.is_admin === true;
    isModerator = membershipData?.is_moderator === true;
    isAppAdmin = userData?.user_type === "ADMIN";
  }

  const mappedBranch = mapBranchRow(branchRow as RawBranchRow);

  // If authenticated member/admin, refresh accurate regular members count
  if (userId && (isMember || isAppAdmin)) {
    const { count: regularMembersCount } = await supabase
      .from("branch_memberships")
      .select("id", { count: "exact", head: true })
      .eq("branch_id", branchId)
      .eq("is_deleted", false)
      .eq("is_admin", false)
      .eq("is_moderator", false);

    if (regularMembersCount !== null && regularMembersCount !== undefined) {
      mappedBranch.members_count = regularMembersCount;
    }
  }

  return createApiResponse(
    {
      branch: mappedBranch,
      meta: {
        is_member: isMember,
        is_admin_user: isAppAdmin,
        is_admin: isAdmin,
        is_moderator: isModerator,
      },
    },
    "Branch details fetched successfully"
  );
};

const searchBranches = async (query: string): Promise<BranchSearchResponse> => {
  let builder = supabase
    .from("branches")
    .select("id, name, cover_image")
    .eq("is_deleted", false);

  const trimmed = query.trim();
  if (trimmed) {
    builder = builder.ilike("name", `%${trimmed}%`);
  }

  const { data: branches, error } = await builder
    .order("name", { ascending: true })
    .limit(50);

  throwIfError(error, "Failed to search branches");

  return createApiResponse(
    {
      branches: (branches || []).map((b) => ({
        id: b.id,
        name: b.name,
        cover_image: b.cover_image,
      })),
    },
    "Branches searched successfully"
  );
};

const joinBranch = async (joinCode: string): Promise<JoinBranchResponse> => {
  void joinCode;
  throw new Error("Join code feature has been removed");
};

const deleteBranch = async (
  branchId: string
): Promise<DeleteBranchResponse> => {
  await getActiveUserId();
  const { error } = await supabase.rpc("soft_delete_branch_rpc", {
    p_branch_id: branchId,
  });

  throwIfError(error, "Failed to delete branch");

  return createApiResponse(
    { branch_id: branchId },
    "Branch deleted successfully"
  );
};

const updateBranch = async (
  branchId: string,
  updated_data: UpdateBranchData
): Promise<UpdateBranchResponse> => {
  const userId = await getActiveUserId();
  await getBranchAccessContext(branchId, userId, { requireStrictAdmin: true });

  const updates: Record<string, unknown> = {};
  if (updated_data.name) updates.name = updated_data.name;
  if (updated_data.description !== undefined)
    updates.description = updated_data.description?.trim() || null;
  if (updated_data.location_name !== undefined)
    updates.location_name = updated_data.location_name?.trim() || null;
  if (updated_data.location_url !== undefined)
    updates.location_url = updated_data.location_url?.trim() || null;
  if (updated_data.admin_info !== undefined)
    updates.admin_info = Array.isArray(updated_data.admin_info)
      ? updated_data.admin_info
      : [];
  if (updated_data.branch_type) updates.branch_type = updated_data.branch_type;
  if (updated_data.parent_branch_id !== undefined)
    updates.parent_branch_id = updated_data.parent_branch_id;

  const { data: updatedBranch, error } = await supabase
    .from("branches")
    .update(updates)
    .eq("id", branchId)
    .select(BRANCH_PUBLIC_COLS)
    .single();

  if (error || !updatedBranch) {
    throw new Error(error?.message || "Failed to update branch");
  }

  return createApiResponse(
    { branch: mapBranchRow(updatedBranch as RawBranchRow) },
    "Branch updated successfully"
  );
};

const getBranchMembers = async (
  branchId: string,
  page: number,
  search?: string
): Promise<BranchMembersResponse> => {
  const userId = await getActiveUserId();

  const { data: branch } = await supabase
    .from("branches")
    .select("id, is_deleted")
    .eq("id", branchId)
    .maybeSingle();

  if (!branch || branch.is_deleted) {
    throw new Error("Branch not found");
  }

  const [{ data: requesterUser }, { data: currentUserMembership }] =
    await Promise.all([
      supabase
        .from("users")
        .select("user_type")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("branch_memberships")
        .select("is_admin")
        .eq("branch_id", branchId)
        .eq("user_id", userId)
        .eq("is_deleted", false)
        .maybeSingle(),
    ]);

  const isAppAdmin = requesterUser?.user_type === "ADMIN";
  if (!currentUserMembership && !isAppAdmin) {
    throw new Error("You are not a member of this branch");
  }

  const isAdmin = currentUserMembership?.is_admin || false;
  const canManage = isAppAdmin || isAdmin;

  const {
    page: p,
    limit,
    from,
    to,
  } = getPaginationParams(page, MEMBERS_LIMIT);

  let memberQuery = supabase
    .from("branch_memberships")
    .select(
      `
      id,
      serial_no,
      name,
      phone,
      address,
      blood_group,
      email,
      note,
      is_admin,
      is_moderator,
      created_at,
      user_id,
      user:users!user_id(id, full_name, user_name, avatar, email)
    `,
      { count: "exact" }
    )
    .eq("branch_id", branchId)
    .eq("is_deleted", false)
    .eq("is_admin", false)
    .eq("is_moderator", false);

  if (search?.trim()) {
    const s = search.trim();
    if (!isNaN(Number(s)) && Number(s) > 0) {
      memberQuery = memberQuery.or(
        `name.ilike.%${s}%,phone.ilike.%${s}%,serial_no.eq.${Number(s)}`
      );
    } else {
      memberQuery = memberQuery.or(`name.ilike.%${s}%,phone.ilike.%${s}%`);
    }
  }

  const { data: memberships, count, error } = await memberQuery
    .order("serial_no", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })
    .range(from, to);

  throwIfError(error, "Failed to fetch branch members");

  const members = (memberships || []).map((m) =>
    formatBranchMember(m, userId, canManage)
  );

  return createApiResponse(
    {
      members,
      pagination: buildPagination(p, limit, count ?? 0),
      meta: {
        is_admin: isAdmin || isAppAdmin,
      },
    },
    "Branch members fetched successfully"
  );
};

const addBranchMember = async (
  branchId: string,
  memberData: AddBranchMemberData
): Promise<{
  statusCode: number;
  success: boolean;
  message: string;
  data: { member: BranchMember };
}> => {
  const userId = await getActiveUserId();
  await getBranchAccessContext(branchId, userId, { requireStrictAdmin: true });

  const serialNo =
    memberData.serial_no !== undefined &&
    memberData.serial_no !== null &&
    String(memberData.serial_no) !== ""
      ? Number(memberData.serial_no)
      : null;

  const insertPayload = {
    branch_id: branchId,
    user_id: null,
    serial_no: serialNo,
    name: memberData.name.trim(),
    phone: memberData.phone.trim(),
    address: memberData.address?.trim() || null,
    blood_group: memberData.blood_group?.trim() || null,
    email: memberData.email?.trim() || null,
    note: memberData.note?.trim() || null,
    is_admin: false,
    is_moderator: false,
    is_deleted: false,
  };

  const { data: newMember, error } = await supabase
    .from("branch_memberships")
    .insert(insertPayload)
    .select()
    .single();

  if (error || !newMember) {
    throw new Error(error?.message || "Failed to add member");
  }

  return createApiResponse(
    { member: formatBranchMember(newMember, userId, true) },
    "Member added successfully",
    201
  );
};

const updateBranchMember = async (
  branchId: string,
  memberId: string,
  memberData: UpdateBranchMemberData
): Promise<{
  statusCode: number;
  success: boolean;
  message: string;
  data: { member: BranchMember };
}> => {
  const userId = await getActiveUserId();
  await getBranchAccessContext(branchId, userId, { requireStrictAdmin: true });

  const { data: targetMembership } = await supabase
    .from("branch_memberships")
    .select("id")
    .eq("id", memberId)
    .eq("branch_id", branchId)
    .maybeSingle();

  if (!targetMembership) {
    throw new Error("Member not found in this branch");
  }

  const updates: Record<string, unknown> = {};
  if (memberData.serial_no !== undefined) {
    updates.serial_no =
      memberData.serial_no !== null && String(memberData.serial_no) !== ""
        ? Number(memberData.serial_no)
        : null;
  }
  if (memberData.name !== undefined) updates.name = memberData.name.trim();
  if (memberData.phone !== undefined)
    updates.phone = memberData.phone ? memberData.phone.trim() : null;
  if (memberData.address !== undefined)
    updates.address = memberData.address ? memberData.address.trim() : null;
  if (memberData.blood_group !== undefined)
    updates.blood_group = memberData.blood_group
      ? memberData.blood_group.trim()
      : null;
  if (memberData.email !== undefined)
    updates.email = memberData.email ? memberData.email.trim() : null;
  if (memberData.note !== undefined)
    updates.note = memberData.note ? memberData.note.trim() : null;

  const { data: updatedMember, error } = await supabase
    .from("branch_memberships")
    .update(updates)
    .eq("id", memberId)
    .select("*, user:users!user_id(id, full_name, user_name, avatar, email)")
    .single();

  if (error || !updatedMember) {
    throw new Error(error?.message || "Failed to update member");
  }

  return createApiResponse(
    { member: formatBranchMember(updatedMember, userId, true) },
    "Member updated successfully"
  );
};

const removeMember = async (
  branchId: string,
  options: { userId?: string; memberId?: string }
): Promise<BaseBranchActionResponse> => {
  const requesterId = await getActiveUserId();
  const { isAppAdmin } = await getBranchAccessContext(branchId, requesterId, {
    requireStrictAdmin: true,
  });

  let query = supabase
    .from("branch_memberships")
    .select("id, user_id, is_admin")
    .eq("branch_id", branchId);

  if (options.memberId) {
    query = query.eq("id", options.memberId);
  } else if (options.userId) {
    query = query.eq("user_id", options.userId);
  } else {
    throw new Error("Member ID or User ID is required");
  }

  const { data: targetMembership } = await query.maybeSingle();

  if (!targetMembership) {
    throw new Error("User is not a member of this branch");
  }

  if (!isAppAdmin && targetMembership.is_admin) {
    throw new Error("Only app administrators can remove branch admins");
  }

  const { error } = await supabase
    .from("branch_memberships")
    .delete()
    .eq("id", targetMembership.id);

  throwIfError(error, "Failed to remove member");

  return createApiResponse(
    { branch_id: branchId },
    "Member removed successfully"
  );
};

const searchUsers = async (
  query: string,
  branchId?: string,
  page: number = 1,
  limit: number = 15
): Promise<SearchUsersResponse> => {
  const requesterId = await getActiveUserId();
  const { page: p, limit: l, from, to } = getPaginationParams(page, limit);

  const { data: requester } = await supabase
    .from("users")
    .select("user_type")
    .eq("id", requesterId)
    .maybeSingle();

  const isAppAdmin = requester?.user_type === "ADMIN";
  if (!isAppAdmin) {
    const { data: adminMembership } = await supabase
      .from("branch_memberships")
      .select("id")
      .eq("user_id", requesterId)
      .eq("is_admin", true)
      .eq("is_deleted", false)
      .limit(1)
      .maybeSingle();

    if (!adminMembership) {
      throw new Error(
        "Only branch admins or app administrators can search users to assign roles"
      );
    }
  }

  let builder = supabase
    .from("users")
    .select("id, full_name, user_name, email, avatar, user_type", {
      count: "exact",
    })
    .eq("account_status", "ACTIVE");

  const trimmedQuery = query?.trim();
  if (trimmedQuery) {
    builder = builder.or(
      `user_name.ilike.%${trimmedQuery}%,full_name.ilike.%${trimmedQuery}%,email.ilike.%${trimmedQuery}%`
    );
  }

  const { data: users, count, error } = await builder
    .order("full_name", { ascending: true })
    .range(from, to);

  throwIfError(error, "Failed to search users");

  const userList = users || [];
  const userIds = userList.map((u) => u.id);

  const branchRoleMap: Record<
    string,
    { is_admin: boolean; is_moderator: boolean }
  > = {};
  if (branchId && userIds.length > 0) {
    const { data: memberships } = await supabase
      .from("branch_memberships")
      .select("user_id, is_admin, is_moderator")
      .eq("branch_id", branchId)
      .in("user_id", userIds)
      .eq("is_deleted", false);

    (memberships || []).forEach((m) => {
      if (m.user_id) {
        branchRoleMap[m.user_id] = {
          is_admin: m.is_admin === true,
          is_moderator: m.is_moderator === true,
        };
      }
    });
  }

  const mappedUsers = userList.map((u) => ({
    ...u,
    is_app_admin: u.user_type === "ADMIN",
    branch_role: branchRoleMap[u.id] || null,
  }));

  return createApiResponse(
    {
      users: mappedUsers,
      pagination: buildPagination(p, l, count || 0),
    },
    "Users searched successfully"
  );
};

const addBranchAdmin = async (
  branchId: string,
  data: AddBranchAdminData
): Promise<AddBranchAdminResponse> => {
  await getActiveUserId();
  const { data: rpcData, error } = await supabase.rpc(
    "promote_or_add_branch_admin_rpc",
    {
      p_branch_id: branchId,
      p_target_user_id: data.user_id,
    }
  );

  throwIfError(error, "Failed to add branch admin");

  return createApiResponse(
    rpcData as { user: AddBranchAdminResponse["data"]["user"] },
    "Branch admin added successfully"
  );
};

const addBranchModerator = async (
  branchId: string,
  data: AddBranchModeratorData
): Promise<AddBranchModeratorResponse> => {
  await getActiveUserId();
  const { data: rpcData, error } = await supabase.rpc(
    "assign_branch_moderator_rpc",
    {
      p_branch_id: branchId,
      p_target_user_id: data.user_id,
      p_allowed_category_ids: data.allowed_category_ids ?? null,
    }
  );

  throwIfError(error, "Failed to add branch moderator");

  return createApiResponse(
    rpcData as AddBranchModeratorResponse["data"],
    "Branch moderator added successfully"
  );
};

const getBranchAdmins = async (
  branchId: string
): Promise<BranchAdminsResponse> => {
  await getActiveUserId();

  const { data: branch, error: branchErr } = await supabase
    .from("branches")
    .select("id, is_deleted")
    .eq("id", branchId)
    .maybeSingle();

  if (branchErr || !branch || branch.is_deleted) {
    throw new Error("Branch not found or has been deleted");
  }

  const { data: admins, error } = await supabase
    .from("branch_memberships")
    .select(
      `
      id,
      user_id,
      is_admin,
      created_at,
      user:users!user_id(id, full_name, user_name, email, avatar)
    `
    )
    .eq("branch_id", branchId)
    .eq("is_admin", true)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true });

  throwIfError(error, "Failed to fetch branch admins");

  const formatted: BranchAdminItem[] = (admins || []).map((a) => {
    const u = unwrapSingle(a.user as RawUserJoin | RawUserJoin[] | null);
    return {
      id: a.id,
      user_id: a.user_id as string,
      is_admin: Boolean(a.is_admin),
      created_at: a.created_at,
      user: {
        id: u?.id || (a.user_id as string),
        full_name: u?.full_name || "",
        user_name: u?.user_name || "",
        email: u?.email || "",
        avatar: u?.avatar || null,
      },
    };
  });

  return createApiResponse(
    { admins: formatted },
    "Branch admins fetched successfully"
  );
};

const removeBranchAdmin = async (
  branchId: string,
  memberId: string
): Promise<{ success: boolean; message: string }> => {
  const requesterId = await getActiveUserId();

  const { data: requester } = await supabase
    .from("users")
    .select("user_type")
    .eq("id", requesterId)
    .maybeSingle();

  if (!requester || requester.user_type !== "ADMIN") {
    throw new Error("Only app administrators can remove branch admins");
  }

  const { data: targetMembership, error: targetErr } = await supabase
    .from("branch_memberships")
    .select("id, is_admin, is_deleted")
    .eq("id", memberId)
    .eq("branch_id", branchId)
    .maybeSingle();

  if (
    targetErr ||
    !targetMembership ||
    targetMembership.is_deleted ||
    !targetMembership.is_admin
  ) {
    throw new Error("Branch admin not found in this branch");
  }

  const { error: delErr } = await supabase
    .from("branch_memberships")
    .delete()
    .eq("id", targetMembership.id);

  throwIfError(delErr, "Failed to remove branch admin");

  return { success: true, message: "Branch admin removed successfully" };
};

const getBranchModerators = async (
  branchId: string
): Promise<BranchModeratorsResponse> => {
  await getActiveUserId();

  const { data: branch, error: branchErr } = await supabase
    .from("branches")
    .select("id, is_deleted")
    .eq("id", branchId)
    .maybeSingle();

  if (branchErr || !branch || branch.is_deleted) {
    throw new Error("Branch not found or has been deleted");
  }

  const [{ data: mods, error }, { data: branchCategories }] = await Promise.all([
    supabase
      .from("branch_memberships")
      .select(
        `
        id,
        user_id,
        is_moderator,
        allowed_category_ids,
        created_at,
        user:users!user_id(id, full_name, user_name, email, avatar)
      `
      )
      .eq("branch_id", branchId)
      .eq("is_moderator", true)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true }),
    supabase
      .from("branch_finance_categories")
      .select("id, name, type")
      .eq("branch_id", branchId),
  ]);

  throwIfError(error, "Failed to fetch branch moderators");

  const catMap = new Map<string, ModeratorAllowedCategory>(
    (branchCategories || []).map((c) => [
      c.id,
      { id: c.id, name: c.name, type: c.type as "INCOME" | "EXPENSE" },
    ])
  );

  const enriched: BranchModeratorItem[] = (mods || []).map((mod) => {
    const u = unwrapSingle(mod.user as RawUserJoin | RawUserJoin[] | null);
    const catIds = Array.isArray(mod.allowed_category_ids)
      ? (mod.allowed_category_ids as string[])
      : null;
    const allowedCategories = catIds
      ? catIds
          .map((id) => catMap.get(id))
          .filter((c): c is ModeratorAllowedCategory => Boolean(c))
      : null;

    return {
      id: mod.id,
      user_id: mod.user_id as string,
      is_moderator: Boolean(mod.is_moderator),
      allowed_category_ids: catIds,
      allowed_categories: allowedCategories,
      created_at: mod.created_at,
      user: {
        id: u?.id || (mod.user_id as string),
        full_name: u?.full_name || "",
        user_name: u?.user_name || "",
        email: u?.email || "",
        avatar: u?.avatar || null,
      },
    };
  });

  return createApiResponse(
    { moderators: enriched },
    "Branch moderators fetched successfully"
  );
};

const removeBranchModerator = async (
  branchId: string,
  memberId: string
): Promise<{ success: boolean; message: string }> => {
  const requesterId = await getActiveUserId();
  const { isAdmin } = await getBranchAccessContext(branchId, requesterId);

  if (!isAdmin) {
    throw new Error(
      "Only branch administrators can remove moderators from this branch"
    );
  }

  const { data: targetMembership, error: targetErr } = await supabase
    .from("branch_memberships")
    .select("id, is_moderator, is_deleted")
    .eq("id", memberId)
    .eq("branch_id", branchId)
    .maybeSingle();

  if (
    targetErr ||
    !targetMembership ||
    targetMembership.is_deleted ||
    !targetMembership.is_moderator
  ) {
    throw new Error("Branch moderator not found in this branch");
  }

  const { error: delErr } = await supabase
    .from("branch_memberships")
    .delete()
    .eq("id", targetMembership.id);

  throwIfError(delErr, "Failed to remove branch moderator");

  return { success: true, message: "Branch moderator removed successfully" };
};

const updateBranchModerator = async (
  branchId: string,
  memberId: string,
  data: UpdateBranchModeratorData
): Promise<UpdateBranchModeratorResponse> => {
  const requesterId = await getActiveUserId();
  const { isAdmin } = await getBranchAccessContext(branchId, requesterId);

  if (!isAdmin) {
    throw new Error(
      "Only branch administrators can update moderator permissions"
    );
  }

  const { data: targetMembership, error: targetErr } = await supabase
    .from("branch_memberships")
    .select("id, is_moderator, is_deleted")
    .eq("id", memberId)
    .eq("branch_id", branchId)
    .maybeSingle();

  if (
    targetErr ||
    !targetMembership ||
    !targetMembership.is_moderator ||
    targetMembership.is_deleted
  ) {
    throw new Error("Branch moderator not found or has been deleted");
  }

  let normalizedCategoryIds: string[] | null = null;
  if (
    Array.isArray(data.allowed_category_ids) &&
    data.allowed_category_ids.length > 0
  ) {
    const { data: validCategories, error: catErr } = await supabase
      .from("branch_finance_categories")
      .select("id")
      .eq("branch_id", branchId)
      .in("id", data.allowed_category_ids);

    if (
      catErr ||
      !validCategories ||
      validCategories.length !== data.allowed_category_ids.length
    ) {
      throw new Error(
        "One or more selected categories are invalid or do not belong to this branch"
      );
    }
    normalizedCategoryIds = data.allowed_category_ids;
  }

  const { error: updateError } = await supabase
    .from("branch_memberships")
    .update({
      allowed_category_ids: normalizedCategoryIds,
      updated_at: new Date().toISOString(),
    })
    .eq("id", memberId);

  throwIfError(updateError, "Failed to update moderator permissions");

  return createApiResponse(
    {
      member_id: memberId,
      allowed_category_ids: normalizedCategoryIds,
    },
    "Moderator category permissions updated"
  );
};

export const branchServices = {
  createBranch,
  getMainBranches,
  getMyBranches,
  getAllBranches,
  getBranchDetails,
  searchBranches,
  joinBranch,
  deleteBranch,
  updateBranch,
  getBranchMembers,
  addBranchMember,
  updateBranchMember,
  removeMember,
  searchUsers,
  addBranchAdmin,
  addBranchModerator,
  updateBranchModerator,
  getBranchAdmins,
  removeBranchAdmin,
  getBranchModerators,
  removeBranchModerator,
} as const;

export default branchServices;
