import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import noticeServices from "@/services/notice.service";
import { NOTICE_KEYS } from "@/constants/queryKeys";
import { handleMutationError } from "@/utils/errorHandler";
import { toast } from "sonner";
import type {
  NoticeQueryParams,
  CreateNoticePayload,
  UpdateNoticePayload,
} from "@/types";

export const useNotices = (params?: NoticeQueryParams, enabled = true) => {
  return useQuery({
    queryKey: [NOTICE_KEYS.ALL, params],
    queryFn: () => noticeServices.getNotices(params),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useNoticeById = (noticeId: string, enabled = true) => {
  return useQuery({
    queryKey: [NOTICE_KEYS.DETAILS, noticeId],
    queryFn: () => noticeServices.getNoticeById(noticeId),
    enabled: Boolean(noticeId) && enabled,
  });
};

export const useCreateNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNoticePayload) => noticeServices.createNotice(data),
    onSuccess: (response) => {
      toast.success(response.message || "Notice published successfully");
      queryClient.invalidateQueries({ queryKey: [NOTICE_KEYS.ALL] });
    },
    onError: handleMutationError("Failed to create notice"),
  });
};

export const useUpdateNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noticeId,
      data,
    }: {
      noticeId: string;
      data: UpdateNoticePayload;
    }) => noticeServices.updateNotice(noticeId, data),
    onSuccess: (response) => {
      toast.success(response.message || "Notice updated successfully");
      queryClient.invalidateQueries({ queryKey: [NOTICE_KEYS.ALL] });
    },
    onError: handleMutationError("Failed to update notice"),
  });
};

export const useDeleteNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noticeId: string) => noticeServices.deleteNotice(noticeId),
    onSuccess: (response) => {
      toast.success(response.message || "Notice deleted successfully");
      queryClient.invalidateQueries({ queryKey: [NOTICE_KEYS.ALL] });
    },
    onError: handleMutationError("Failed to delete notice"),
  });
};
