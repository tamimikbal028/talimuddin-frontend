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
  CreateBranchData,
  UpdateBranchData,
  AddBranchMemberData,
  UpdateBranchMemberData,
} from "@/types";
import { BRANCH_KEYS } from "@/constants";
import { handleMutationError } from "@/utils/errorHandler";

const useCreateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (branchData: CreateBranchData) =>
      branchServices.createBranch(branchData),
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

const useMyBranches = (enabled = true) => {
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
    enabled,
  });
};

const useAllBranches = () => {
  return useInfiniteQuery({
    queryKey: ["allBranches", "infinite"],
    queryFn: ({ pageParam }) =>
      branchServices.getAllBranches(pageParam as number),
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

const useBranchDirectorySearch = (query: string) => {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: [BRANCH_KEYS.SEARCH, "directory", normalizedQuery],
    queryFn: () => branchServices.searchBranches(normalizedQuery),
    staleTime: 1000 * 60 * 2,
    retry: 0,
    enabled: !!normalizedQuery,
  });
};

const useSearchUsers = (query: string, enabled = true) => {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: ["users", "search", normalizedQuery],
    queryFn: () => branchServices.searchUsers(normalizedQuery),
    staleTime: 1000 * 30,
    retry: 1,
    enabled,
  });
};

const useAddBranchAdmin = () => {
  const { branchId } = useParams();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { user_id: string }) =>
      branchServices.addBranchAdmin(branchId as string, data),
    onSuccess: (response) => {
      toast.success(response.message || "Branch admin added successfully");
      queryClient.invalidateQueries({
        queryKey: [BRANCH_KEYS.DETAILS, branchId],
      });
      queryClient.invalidateQueries({
        queryKey: [BRANCH_KEYS.MEMBERS, branchId],
      });
    },
    onError: handleMutationError("Failed to add branch admin"),
  });
};

const branchHooks = {
  useCreateBranch,
  useMainBranches,
  useMyBranches,
  useAllBranches,
  useBranchDetails,
  useJoinBranch,
  useDeleteBranch,
  useUpdateBranchDetails,
  useUpdateBranchCoverImage,

  // Members
  useBranchMembers,
  useAddBranchMember,
  useUpdateBranchMember,
  useRemoveBranchMember,
  useBranchDirectorySearch,

  // Admins & Users
  useSearchUsers,
  useAddBranchAdmin,
} as const;

export default branchHooks;
