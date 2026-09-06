import type { User } from "@/types/user.types";
import type { Pagination } from "@/types/common.types";
import { BRANCH_TYPES } from "@/constants/branch";

// Branch (full object from backend)
export interface Branch {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  branch_type: (typeof BRANCH_TYPES)[keyof typeof BRANCH_TYPES];
  parent_branch_id?: string | null;
  parent_branch?: {
    id: string;
    name: string;
  } | null;
  join_code: string;
  creator: User;
  members_count: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

// Branch in list (getMyBranches response) - minimal fields for card display
export interface BranchListItem {
  id: string;
  name: string;
  cover_image: string | null;
  creator: {
    full_name: string;
    user_name: string;
  };
}

// Branch Meta (from getBranchDetails)
export interface BranchMeta {
  is_member: boolean;
  is_admin_user: boolean;
  is_creator: boolean;
  is_admin: boolean;
  join_code: string;
}

// Branch Member (from getBranchMembers)
export interface BranchMember {
  id?: string;
  name?: string;
  phone?: string | null;
  address?: string | null;
  blood_group?: string | null;
  email?: string | null;
  note?: string | null;
  user: User;
  meta: {
    member_id: string;
    is_self: boolean;
    is_admin: boolean;
    is_creator: boolean;
    is_manual?: boolean;
    joined_at: string;
    user_relation_status: string;
    can_manage: boolean;
    institution?: {
      id: string;
      name: string;
    } | null;
  };
}

export interface AddBranchMemberData {
  name: string;
  phone: string;
  address?: string | null;
  blood_group?: string | null;
  email?: string | null;
  note?: string | null;
}

export interface UpdateBranchMemberData {
  name?: string;
  phone?: string;
  address?: string | null;
  blood_group?: string | null;
  email?: string | null;
  note?: string | null;
}

// Update Branch Data (for updateBranch API)
export interface UpdateBranchData {
  name: string;
  description: string | null;
  branch_type?: (typeof BRANCH_TYPES)[keyof typeof BRANCH_TYPES];
  parent_branch_id?: string | null;
}

// API Response Types
export interface BranchDetailsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    branch: Branch;
    meta: BranchMeta;
  };
}

export interface MyBranchesResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    branches: BranchListItem[];
    pagination: Pagination;
  };
}

export interface CreateBranchResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    branch: Branch;
    meta: {
      is_member: boolean;
      is_creator: boolean;
      is_admin: boolean;
    };
  };
}

export interface JoinBranchResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    branch_id: string;
    branch_name: string;
  };
}


export interface DeleteBranchResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    branch_id: string;
  };
}

export interface UpdateBranchResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    branch: Branch;
  };
}

export interface BranchMembersResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    members: BranchMember[];
    pagination: Pagination;
    meta: {
      is_creator: boolean;
      is_admin: boolean;
    };
  };
}

export interface BaseBranchActionResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    branch_id: string;
  };
}

export interface BranchSearchResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    branches: BranchListItem[];
  };
}

export interface MainBranchItem {
  id: string;
  name: string;
}

export interface MainBranchesResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    branches: MainBranchItem[];
  };
}
