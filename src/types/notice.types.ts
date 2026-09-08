import type { ApiResponse, Pagination } from "./common.types";

export interface NoticeAuthor {
  id: string;
  full_name: string;
  user_name: string;
  avatar: string | null;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_active: boolean;
  is_deleted: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  author?: NoticeAuthor | null;
}

export interface CreateNoticePayload {
  title: string;
  content: string;
  is_pinned?: boolean;
  is_active?: boolean;
}

export interface UpdateNoticePayload {
  title?: string;
  content?: string;
  is_pinned?: boolean;
  is_active?: boolean;
}

export interface NoticeQueryParams {
  page?: number;
  limit?: number;
  q?: string;
}

export type NoticesResponse = ApiResponse<{
  notices: Notice[];
  pagination: Pagination;
}>;

export type SingleNoticeResponse = ApiResponse<{
  notice: Notice;
}>;
