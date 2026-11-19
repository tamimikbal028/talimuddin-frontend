import { supabase } from "@/config/supabase";
import type { Pagination } from "@/types";

export const getPaginationParams = (pageInput?: number, limitInput?: number) => {
  const page = Math.max(1, Number(pageInput) || 1);
  const limit = Math.max(1, Number(limitInput) || 10);
  const from = (page - 1) * limit;
  const to = page * limit - 1;
  return { page, limit, from, to };
};

export const buildPagination = (
  page: number,
  limit: number,
  totalDocs: number
): Pagination => {
  const totalPages = Math.ceil(totalDocs / limit) || 0;
  return {
    page,
    limit,
    totalDocs,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

export const getOptionalAuthUserId = async (): Promise<string | null> => {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.user) {
    return null;
  }
  return data.session.user.id;
};

export const throwIfError = (
  error: { message?: string } | null | undefined,
  fallbackMessage: string
): never | void => {
  if (error) {
    throw new Error(error.message || fallbackMessage);
  }
};

export interface BranchAccessContext {
  userId: string;
  isAppAdmin: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  allowedCategoryIds: string[] | null;
}

export const getBranchAccessContext = async (
  branchId: string,
  userId: string,
  options: {
    requireBranchStaff?: boolean;
    requireStrictAdmin?: boolean;
    requireFinanceAccess?: boolean;
  } = {}
): Promise<BranchAccessContext> => {
  const { data: branch, error: branchErr } = await supabase
    .from("branches")
    .select("id, is_deleted")
    .eq("id", branchId)
    .maybeSingle();

  if (branchErr || !branch || branch.is_deleted) {
    throw new Error("Branch not found or has been deleted");
  }

  const [{ data: user }, { data: membership }] = await Promise.all([
    supabase
      .from("users")
      .select("user_type")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("branch_memberships")
      .select("is_admin, is_moderator, allowed_category_ids")
      .eq("branch_id", branchId)
      .eq("user_id", userId)
      .eq("is_deleted", false)
      .maybeSingle(),
  ]);

  const isAppAdmin = user?.user_type === "ADMIN";
  const isAdmin = membership?.is_admin === true;
  const isModerator = membership?.is_moderator === true;
  const allowedCategoryIds = Array.isArray(membership?.allowed_category_ids)
    ? (membership.allowed_category_ids as string[])
    : null;

  if (options.requireBranchStaff && !isAdmin && !isModerator) {
    throw new Error(
      "Only branch administrators or moderators can perform this action"
    );
  }

  if (options.requireStrictAdmin && !isAdmin && !isAppAdmin) {
    throw new Error(
      "Only branch admins or app administrators can perform this action"
    );
  }

  if (
    options.requireFinanceAccess &&
    !isAdmin &&
    !isAppAdmin &&
    !isModerator
  ) {
    throw new Error(
      "Only branch admins, moderators or app administrators can access branch finance"
    );
  }

  return {
    userId,
    isAppAdmin,
    isAdmin,
    isModerator,
    allowedCategoryIds,
  };
};
