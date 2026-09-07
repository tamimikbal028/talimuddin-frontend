import type { User } from "@/types/user.types";
import type { Pagination } from "@/types/common.types";
import { BRANCH_TYPES } from "@/constants/branch";

// Branch (full object from backend)
export interface Branch {
  id: string;
  name: string;
  description: string | null;
  location_name?: string | null;
  location_url?: string | null;
  admin_info?: BranchAdminInfo[];
  cover_image: string | null;
  branch_type: (typeof BRANCH_TYPES)[keyof typeof BRANCH_TYPES];
  parent_branch_id?: string | null;
  parent_branch?: {
    id: string;
    name: string;
  } | null;
  members_count: number;
  is_deleted: boolean;
}

// Branch in list (getMyBranches response) - minimal fields for card display
export interface BranchListItem {
  id: string;
  name: string;
  cover_image: string | null;
}

// Branch Meta (from getBranchDetails)
export interface BranchMeta {
  is_member: boolean;
  is_admin_user: boolean;
  is_admin: boolean;
}

// Branch Member (from getBranchMembers)
export interface BranchMember {
  id?: string;
  serial_no?: number | null;
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
  serial_no?: number | null;
  name: string;
  phone: string;
  address?: string | null;
  blood_group?: string | null;
  email?: string | null;
  note?: string | null;
}

export interface UpdateBranchMemberData {
  serial_no?: number | null;
  name?: string;
  phone?: string;
  address?: string | null;
  blood_group?: string | null;
  email?: string | null;
  note?: string | null;
}

// Branch Admin Info item
export interface BranchAdminInfo {
  name: string;
  number: string;
}

// Create Branch Data (for createBranch API)
export interface CreateBranchData {
  name: string;
  description?: string | null;
  location_name?: string | null;
  location_url?: string | null;
  admin_info?: BranchAdminInfo[];
  branch_type?: (typeof BRANCH_TYPES)[keyof typeof BRANCH_TYPES];
  parent_branch_id?: string | null;
}

// Update Branch Data (for updateBranch API)
export interface UpdateBranchData {
  name: string;
  description: string | null;
  location_name?: string | null;
  location_url?: string | null;
  admin_info?: BranchAdminInfo[];
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
    meta?: {
      is_member: boolean;
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

export interface SearchUserItem {
  id: string;
  full_name: string;
  user_name: string;
  email: string;
  avatar: string | null;
}

export interface SearchUsersResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    users: SearchUserItem[];
  };
}

export interface AddBranchAdminData {
  user_id: string;
}

export interface AddBranchAdminResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    user: SearchUserItem;
  };
}
