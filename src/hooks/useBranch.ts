import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { branchServices } from "@/services/branch.service";
import { uploadSingleImage } from "@/services/common/fileUpload.service";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import type {
  UpdateBranchData,
  AddBranchMemberData,
  UpdateBranchMemberData,
} from "@/types";
import { BRANCH_KEYS } from "@/constants";
import { handleMutationError } from "@/utils/errorHandler";

const useCreateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (branchData: {
      name: string;
      description?: string;
      branch_type?: "MAIN" | "SUB";
      parent_branch_id?: string | null;
    }) => branchServices.createBranch(branchData),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["myBranches"] });
      queryClient.invalidateQueries({ queryKey: ["mainBranches"] });
    },
    onError: handleMutationError("Failed to create branch"),
  });
};

const useMainBranches = () => {
  return useQuery({
    queryKey: ["mainBranches"],
    queryFn: () => branchServices.getMainBranches(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

const useMyBranches = () => {
  return useInfiniteQuery({
    queryKey: ["myBranches", "infinite"],
    queryFn: ({ pageParam }) =>
      branchServices.getMyBranches(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

const useBranchDetails = () => {
  const { branchId } = useParams();
  return useQuery({
    queryKey: [BRANCH_KEYS.DETAILS, branchId],
    queryFn: () => branchServices.getBranchDetails(branchId as string),
    enabled: !!branchId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  });
};

const useJoinBranch = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (joinCode: string) => branchServices.joinBranch(joinCode),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["myBranches"] });
      queryClient.invalidateQueries({ queryKey: [BRANCH_KEYS.DETAILS] });

      // Navigate to branch details
      const branchId = data.data.branch_id;
      if (branchId) {
        navigate(`/branch/branches/${branchId}`);
      }
    },
    onError: handleMutationError("Failed to join branch"),
  });
};

const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (branchId: string) => branchServices.deleteBranch(branchId),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["myBranches"] });
      navigate("/branch");
    },
    onError: handleMutationError("Failed to delete branch"),
  });
};

const useLeaveBranch = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (branchId: string) => branchServices.leaveBranch(branchId),
    onSuccess: (data) => {
      toast.success(data.message);

      // Invalidate branch queries
      queryClient.invalidateQueries({ queryKey: ["myBranches"] });

      // Navigate back to branch
      navigate("/branch");
    },
    onError: handleMutationError("Failed to leave branch"),
  });
};

const useUpdateBranchDetails = () => {
  const { branchId } = useParams();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      updated_data,
    }: {
      updated_data: Partial<UpdateBranchData>;
    }) =>
      branchServices.updateBranch(
        branchId as string,
        updated_data as UpdateBranchData
      ),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: [BRANCH_KEYS.DETAILS] });
      queryClient.invalidateQueries({ queryKey: ["myBranches"] });
    },
    onError: handleMutationError("Failed to update branch details"),
  });
};

const useUpdateBranchCoverImage = () => {
  const { branchId } = useParams();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cover_image: File) =>
      uploadSingleImage(cover_image, "branch_cover", branchId as string),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: [BRANCH_KEYS.DETAILS] });
      queryClient.invalidateQueries({ queryKey: ["myBranches"] });
    },
    onError: handleMutationError("Failed to update branch cover image"),
  });
};

// ====================================
// Branch Members
// ====================================

const useBranchMembers = (search?: string) => {
  const { branchId } = useParams();
  return useInfiniteQuery({
    queryKey: [BRANCH_KEYS.MEMBERS, branchId, search || ""],
    queryFn: ({ pageParam }) =>
      branchServices.getBranchMembers(
        branchId as string,
        pageParam as number,
        search
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: !!branchId,
    staleTime: 1000 * 60,
  });
};

const useAddBranchMember = () => {
  const { branchId } = useParams();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddBranchMemberData) =>
      branchServices.addBranchMember(branchId as string, data),
    onSuccess: (response) => {
      toast.success(response.message || "Member added successfully");
      queryClient.invalidateQueries({
        queryKey: [BRANCH_KEYS.MEMBERS, branchId],
      });
      queryClient.invalidateQueries({
        queryKey: [BRANCH_KEYS.DETAILS, branchId],
      });
    },
    onError: handleMutationError("Failed to add member"),
  });
};

const useUpdateBranchMember = () => {
  const { branchId } = useParams();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      data,
    }: {
      memberId: string;
      data: UpdateBranchMemberData;
    }) => branchServices.updateBranchMember(branchId as string, memberId, data),
    onSuccess: (response) => {
      toast.success(response.message || "Member updated successfully");
      queryClient.invalidateQueries({
        queryKey: [BRANCH_KEYS.MEMBERS, branchId],
      });
    },
    onError: handleMutationError("Failed to update member"),
  });
};

const useRemoveBranchMember = () => {
  const { branchId } = useParams();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options: { userId?: string; memberId?: string }) =>
      branchServices.removeMember(branchId as string, options),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({
        queryKey: [BRANCH_KEYS.MEMBERS, branchId],
      });
      queryClient.invalidateQueries({
        queryKey: [BRANCH_KEYS.DETAILS, branchId],
      });
    },
    onError: handleMutationError("Failed to remove member"),
  });
};

const usePromoteBranchMember = () => {
  const { branchId } = useParams();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      branchServices.promoteMember(branchId as string, userId),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({
        queryKey: [BRANCH_KEYS.MEMBERS, branchId],
      });
    },
    onError: handleMutationError("Failed to promote member"),
  });
};

const useDemoteBranchMember = () => {
  const { branchId } = useParams();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      branchServices.demoteMember(branchId as string, userId),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({
        queryKey: [BRANCH_KEYS.MEMBERS, branchId],
      });
    },
    onError: handleMutationError("Failed to demote member"),
  });
};

const useBranchDirectorySearch = (query: string) => {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: [BRANCH_KEYS.SEARCH, "directory", normalizedQuery],
    queryFn: () => branchServices.searchBranches(normalizedQuery),
    staleTime: 1000 * 60 * 2,
    retry: 0,
  });
};

const branchHooks = {
  useCreateBranch,
  useMainBranches,
  useMyBranches,
  useBranchDetails,
  useJoinBranch,
  useDeleteBranch,
  useLeaveBranch,
  useUpdateBranchDetails,
  useUpdateBranchCoverImage,

  // Members
  useBranchMembers,
  useAddBranchMember,
  useUpdateBranchMember,
  useRemoveBranchMember,
  usePromoteBranchMember,
  useDemoteBranchMember,
  useBranchDirectorySearch,
} as const;

export default branchHooks;
