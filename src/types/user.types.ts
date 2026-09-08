import type { ApiResponse } from "@/types/common.types";
import {
  USER_TYPES,
  ACCOUNT_STATUS,
} from "../constants";

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];
export type AccountStatus =
  (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];

// User Details (Full Profile)
export interface User {
  id: string;
  full_name: string;
  user_name: string;
  email: string;
  avatar: string | null;
  user_type: UserType;
  account_status: AccountStatus;
  created_at: string;
  updated_at: string;
}

// ====================================
// AUTH STATE
// ====================================

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
}

export type AuthResponse = ApiResponse<{
  user: AuthUser;
  meta: UserMeta;
  supabaseSession?: SupabaseSession | null;
}>;

export interface AuthUser {
  id: string;
  full_name: string;
  user_name: string;
  email: string;
  avatar: string | null;
  user_type: UserType;
  account_status: AccountStatus;
  password_changed_at: string | null;
}

export interface UserMeta {
  is_app_admin: boolean;
  is_app_moderator: boolean;
  is_branch_admin?: boolean;
}


// Login Types
export interface LoginType {
  email: string;
  password: string;
}

// Register Types
export interface RegisterType {
  full_name: string;
  email: string;
  password: string;
  user_type: UserType;
  agree_to_terms: boolean;
}
