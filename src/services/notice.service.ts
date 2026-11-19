import { getActiveUserId, supabase } from "@/config/supabase";
import { createApiResponse } from "@/utils/apiResponse";
import {
  buildPagination,
  getPaginationParams,
  throwIfError,
} from "@/utils/supabaseHelpers";
import type {
  NoticeQueryParams,
  NoticesResponse,
  SingleNoticeResponse,
  CreateNoticePayload,
  UpdateNoticePayload,
  ApiResponse,
  Notice,
  NoticeAuthor,
} from "../types";

const NOTICE_SELECT = `
  id,
  title,
  content,
  is_pinned,
  is_active,
  is_deleted,
  created_by,
  created_at,
  updated_at,
  author:created_by (
    id,
    full_name,
    user_name,
    avatar
  )
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapNoticeRow = (row: any): Notice => {
  const author = Array.isArray(row.author)
    ? (row.author[0] as NoticeAuthor | undefined) || null
    : (row.author as NoticeAuthor | null) || null;

  return {
    id: row.id,
    title: row.title,
    content: row.content,
    is_pinned: Boolean(row.is_pinned),
    is_active: Boolean(row.is_active),
    is_deleted: Boolean(row.is_deleted),
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author,
  };
};

const getNotices = async (
  params?: NoticeQueryParams
): Promise<NoticesResponse> => {
  const userId = await getActiveUserId();
  const { page, limit, from, to } = getPaginationParams(
    params?.page,
    params?.limit
  );
  const search = typeof params?.q === "string" ? params.q.trim() : "";

  const { data: userRow } = await supabase
    .from("users")
    .select("user_type")
    .eq("id", userId)
    .maybeSingle();

  const isAppAdmin = userRow?.user_type === "ADMIN";

  let queryBuilder = supabase
    .from("notices")
    .select(NOTICE_SELECT, { count: "exact" })
    .eq("is_deleted", false);

  if (!isAppAdmin) {
    queryBuilder = queryBuilder.eq("is_active", true);
  }

  if (search) {
    queryBuilder = queryBuilder.or(
      `title.ilike.%${search}%,content.ilike.%${search}%`
    );
  }

  const { data: noticeRows, count, error } = await queryBuilder
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  throwIfError(error, "Failed to fetch notices");

  const notices = (noticeRows || []).map(mapNoticeRow);
  const pagination = buildPagination(page, limit, count || 0);

  return createApiResponse(
    { notices, pagination },
    "Notices fetched successfully"
  );
};

const getNoticeById = async (
  noticeId: string
): Promise<SingleNoticeResponse> => {
  await getActiveUserId();

  const { data: notice, error } = await supabase
    .from("notices")
    .select(NOTICE_SELECT)
    .eq("id", noticeId)
    .eq("is_deleted", false)
    .maybeSingle();

  throwIfError(error, "Failed to retrieve notice");

  if (!notice) {
    throw new Error("Notice not found");
  }

  return createApiResponse(
    { notice: mapNoticeRow(notice) },
    "Notice fetched successfully"
  );
};

const createNotice = async (
  data: CreateNoticePayload
): Promise<SingleNoticeResponse> => {
  const userId = await getActiveUserId();

  const insertPayload = {
    title: data.title.trim(),
    content: data.content.trim(),
    is_pinned: Boolean(data.is_pinned),
    is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
    created_by: userId,
  };

  const { data: newNotice, error } = await supabase
    .from("notices")
    .insert([insertPayload])
    .select(NOTICE_SELECT)
    .single();

  if (error || !newNotice) {
    throw new Error(error?.message || "Failed to create notice");
  }

  return createApiResponse(
    { notice: mapNoticeRow(newNotice) },
    "Notice created successfully",
    201
  );
};

const updateNotice = async (
  noticeId: string,
  data: UpdateNoticePayload
): Promise<SingleNoticeResponse> => {
  await getActiveUserId();

  const updatePayload: Record<string, unknown> = {};
  if (data.title !== undefined) updatePayload.title = data.title.trim();
  if (data.content !== undefined) updatePayload.content = data.content.trim();
  if (data.is_pinned !== undefined)
    updatePayload.is_pinned = Boolean(data.is_pinned);
  if (data.is_active !== undefined)
    updatePayload.is_active = Boolean(data.is_active);

  const { data: updatedNotice, error } = await supabase
    .from("notices")
    .update(updatePayload)
    .eq("id", noticeId)
    .eq("is_deleted", false)
    .select(NOTICE_SELECT)
    .single();

  if (error || !updatedNotice) {
    throw new Error(error?.message || "Failed to update notice");
  }

  return createApiResponse(
    { notice: mapNoticeRow(updatedNotice) },
    "Notice updated successfully"
  );
};

const deleteNotice = async (
  noticeId: string
): Promise<ApiResponse<{ result: { success: boolean } }>> => {
  await getActiveUserId();

  const { error } = await supabase
    .from("notices")
    .update({ is_deleted: true, is_active: false })
    .eq("id", noticeId);

  throwIfError(error, "Failed to delete notice");

  return createApiResponse(
    { result: { success: true } },
    "Notice deleted successfully"
  );
};

const noticeServices = {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
};

export default noticeServices;
