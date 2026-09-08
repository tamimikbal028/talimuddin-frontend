import api from "@/config/axios";
import { BRANCH_LIMIT, MEMBERS_LIMIT } from "@/constants";
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
} from "../types";


const createBranch = async (
  branchData: CreateBranchData
): Promise<CreateBranchResponse> => {
  const response = await api.post<CreateBranchResponse>(
    "/branches",
    branchData
  );
  return response.data;
};

const getMainBranches = async (): Promise<MainBranchesResponse> => {
  const response = await api.get<MainBranchesResponse>(
    "/branches/main-branches"
  );
  return response.data;
};

const getMyBranches = async (page: number): Promise<MyBranchesResponse> => {
  const response = await api.get<MyBranchesResponse>(
    `/branches/myBranches?page=${page}&limit=${BRANCH_LIMIT}`
  );
  return response.data;
};

const getAllBranches = async (page: number): Promise<MyBranchesResponse> => {
  const response = await api.get<MyBranchesResponse>(
    `/branches?page=${page}&limit=${BRANCH_LIMIT}`
  );
  return response.data;
};

const getBranchDetails = async (
  branchId: string
): Promise<BranchDetailsResponse> => {
  const response = await api.get<BranchDetailsResponse>(
    `/branches/${branchId}`
  );
  return response.data;
};

const searchBranches = async (query: string): Promise<BranchSearchResponse> => {
  const response = await api.get<BranchSearchResponse>(
    `/branches/search?q=${encodeURIComponent(query)}`
  );
  return response.data;
};

const joinBranch = async (joinCode: string): Promise<JoinBranchResponse> => {
  const response = await api.post<JoinBranchResponse>("/branches/join", {
    joinCode,
  });
  return response.data;
};

const deleteBranch = async (
  branchId: string
): Promise<DeleteBranchResponse> => {
  const response = await api.delete<DeleteBranchResponse>(
    `/branches/${branchId}`
  );
  return response.data;
};

const updateBranch = async (
  branchId: string,
  updated_data: UpdateBranchData
): Promise<UpdateBranchResponse> => {
  const response = await api.patch<UpdateBranchResponse>(
    `/branches/${branchId}`,
    updated_data
  );
  return response.data;
};

const getBranchMembers = async (
  branchId: string,
  page: number,
  search?: string
): Promise<BranchMembersResponse> => {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
  const response = await api.get<BranchMembersResponse>(
    `/branches/${branchId}/members?page=${page}&limit=${MEMBERS_LIMIT}${searchParam}`
  );
  return response.data;
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
  const response = await api.post(`/branches/${branchId}/members`, memberData);
  return response.data;
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
  const response = await api.patch(
    `/branches/${branchId}/members/${memberId}`,
    memberData
  );
  return response.data;
};

const removeMember = async (
  branchId: string,
  options: { userId?: string; memberId?: string }
): Promise<BaseBranchActionResponse> => {
  if (options.memberId) {
    const response = await api.delete<BaseBranchActionResponse>(
      `/branches/${branchId}/members/${options.memberId}`
    );
    return response.data;
  }
  const response = await api.delete<BaseBranchActionResponse>(
    `/branches/${branchId}/remove`,
    { data: { userId: options.userId } }
  );
  return response.data;
};

const searchUsers = async (
  query: string,
  branchId?: string
): Promise<SearchUsersResponse> => {
  const branchParam = branchId
    ? `&branchId=${encodeURIComponent(branchId)}`
    : "";
  const response = await api.get<SearchUsersResponse>(
    `/branches/users/search?query=${encodeURIComponent(query)}${branchParam}`
  );
  return response.data;
};


const addBranchAdmin = async (
  branchId: string,
  data: AddBranchAdminData
): Promise<AddBranchAdminResponse> => {
  const response = await api.post<AddBranchAdminResponse>(
    `/branches/${branchId}/admins`,
    data
  );
  return response.data;
};

const addBranchModerator = async (
  branchId: string,
  data: AddBranchModeratorData
): Promise<AddBranchModeratorResponse> => {
  const response = await api.post<AddBranchModeratorResponse>(
    `/branches/${branchId}/moderators`,
    data
  );
  return response.data;
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
} as const;

export default branchServices;

