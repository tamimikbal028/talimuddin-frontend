import api from "@/config/axios";
import type {
  NoticeQueryParams,
  NoticesResponse,
  SingleNoticeResponse,
  CreateNoticePayload,
  UpdateNoticePayload,
  ApiResponse,
} from "../types";

const getNotices = async (
  params?: NoticeQueryParams
): Promise<NoticesResponse> => {
  const response = await api.get<NoticesResponse>("/notices", { params });
  return response.data;
};

const getNoticeById = async (
  noticeId: string
): Promise<SingleNoticeResponse> => {
  const response = await api.get<SingleNoticeResponse>(`/notices/${noticeId}`);
  return response.data;
};

const createNotice = async (
  data: CreateNoticePayload
): Promise<SingleNoticeResponse> => {
  const response = await api.post<SingleNoticeResponse>("/notices", data);
  return response.data;
};

const updateNotice = async (
  noticeId: string,
  data: UpdateNoticePayload
): Promise<SingleNoticeResponse> => {
  const response = await api.patch<SingleNoticeResponse>(
    `/notices/${noticeId}`,
    data
  );
  return response.data;
};

const deleteNotice = async (
  noticeId: string
): Promise<ApiResponse<{ result: { success: boolean } }>> => {
  const response = await api.delete<
    ApiResponse<{ result: { success: boolean } }>
  >(`/notices/${noticeId}`);
  return response.data;
};

const noticeServices = {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
};

export default noticeServices;
