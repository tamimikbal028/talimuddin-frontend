import { supabase } from "@/config/supabase";
import { ACCOUNT_STATUS, USER_TYPES } from "@/constants";
import { createApiResponse } from "@/utils/apiResponse";
import type {
  LoginType,
  ApiResponse,
  RegisterType,
  AuthResponse,
  AuthUser,
  UserMeta,
  EmptyObject,
} from "../types";

const AUTH_USER_DB_SELECT =
  "id, full_name, user_name, email, avatar, user_type, account_status, password_changed_at";

const fetchProfileById = async (userId: string): Promise<AuthUser> => {
  const { data, error } = await supabase
    .from("users")
    .select(AUTH_USER_DB_SELECT)
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw new Error("User does not exist");
  }

  return data as AuthUser;
};

const assertAccountAllowed = async (profile: AuthUser): Promise<void> => {
  if (profile.account_status === ACCOUNT_STATUS.DELETED) {
    await supabase.auth.signOut().catch(() => undefined);
    throw new Error("Your account no longer exists or has been deleted.");
  }
};

const buildAuthUserWithMeta = async (
  profile: AuthUser
): Promise<{ user: AuthUser; meta: UserMeta }> => {
  const is_app_admin = profile.user_type === USER_TYPES.ADMIN;

  let is_branch_admin = false;
  if (is_app_admin) {
    is_branch_admin = true;
  } else if (profile.id) {
    const { data: adminMemberships } = await supabase
      .from("branch_memberships")
      .select("id")
      .eq("user_id", profile.id)
      .eq("is_admin", true)
      .eq("is_deleted", false)
      .limit(1);

    is_branch_admin = Boolean(adminMemberships && adminMemberships.length > 0);
  }

  return {
    user: profile,
    meta: {
      is_app_admin,
      is_branch_admin,
      is_app_moderator: false,
    },
  };
};

const getCurrentUser = async (): Promise<AuthResponse> => {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError || !sessionData.session?.user) {
    throw new Error("Unauthorized");
  }

  const profile = await fetchProfileById(sessionData.session.user.id);
  await assertAccountAllowed(profile);

  const { user, meta } = await buildAuthUserWithMeta(profile);
  return createApiResponse({ user, meta }, "Current user fetched successfully");
};

const register = async (registerData: RegisterType): Promise<AuthResponse> => {
  const { full_name, email, password, user_type, agree_to_terms } =
    registerData;
  const normalizedEmail = email.toLowerCase().trim();

  if (user_type === USER_TYPES.ADMIN) {
    throw new Error("Restricted user type.");
  }

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        full_name,
        user_type,
        agree_to_terms,
      },
      emailRedirectTo: `${window.location.origin}/login`,
    },
  });

  if (signUpError || !authData?.user) {
    const msg = signUpError?.message?.toLowerCase() || "";
    if (
      signUpError?.code === "over_email_send_rate_limit" ||
      msg.includes("rate limit")
    ) {
      throw new Error(
        "ইমেইল পাঠানোর লিমিট শেষ হয়ে গেছে (Supabase email rate limit exceeded)। কিছুক্ষণ পর চেষ্টা করুন অথবা কাস্টম SMTP ব্যবহার করুন।"
      );
    }
    if (msg.includes("already")) {
      throw new Error("User with this email already exists");
    }
    throw new Error(
      signUpError?.message || "Something went wrong while registering the user"
    );
  }

  if (
    Array.isArray(authData.user.identities) &&
    authData.user.identities.length === 0
  ) {
    throw new Error("User with this email already exists");
  }

  const isEmailConfirmed = Boolean(
    authData.user.email_confirmed_at || authData.session
  );

  if (!isEmailConfirmed) {
    return createApiResponse(
      {
        emailConfirmationRequired: true,
      },
      "নিবন্ধন সফল হয়েছে! অনুগ্রহ করে আপনার ইমেইল ইনবক্স চেক করে একাউন্ট কনফার্মেশন লিংকে ক্লিক করুন।",
      201
    );
  }

  const profile = await fetchProfileById(authData.user.id);
  const { user, meta } = await buildAuthUserWithMeta(profile);

  return createApiResponse(
    {
      emailConfirmationRequired: false,
      user,
      meta,
    },
    "User registered Successfully"
  );
};

const login = async (loginData: LoginType): Promise<AuthResponse> => {
  const email = loginData.email?.trim();
  const { password } = loginData;

  if (!email) {
    throw new Error("Email is required");
  }

  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (signInError || !signInData?.user) {
    const msg = signInError?.message?.toLowerCase() || "";
    if (
      signInError?.code === "email_not_confirmed" ||
      msg.includes("email not confirmed")
    ) {
      throw new Error(
        "আপনার ইমেইল ভেরিফাই করা হয়নি। অনুগ্রহ করে ইনবক্স অথবা স্প্যাম ফোল্ডার চেক করে কনফার্মেশন লিংকে ক্লিক করুন।"
      );
    }
    throw new Error("Email or password is incorrect.");
  }

  const profile = await fetchProfileById(signInData.user.id);
  await assertAccountAllowed(profile);

  const { user, meta } = await buildAuthUserWithMeta(profile);

  return createApiResponse(
    { user, meta },
    `Welcome back ${user.full_name}!`
  );
};

const logout = async (): Promise<ApiResponse<EmptyObject>> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message || "Logout failed");
  }
  return createApiResponse({}, "User logged out successfully");
};

const changePassword = async (data: {
  oldPassword: string;
  newPassword: string;
}): Promise<ApiResponse<EmptyObject>> => {
  const { data: sessionData, error: sessionErr } =
    await supabase.auth.getSession();
  const sessionUser = sessionData.session?.user;

  if (sessionErr || !sessionUser?.email) {
    throw new Error("Unauthorized");
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: sessionUser.email,
    password: data.oldPassword,
  });

  if (verifyError) {
    throw new Error("Invalid old password");
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: data.newPassword,
  });

  if (updateError) {
    throw new Error(updateError.message || "Failed to update password");
  }

  const { error: profileError } = await supabase
    .from("users")
    .update({ password_changed_at: new Date().toISOString() })
    .eq("id", sessionUser.id);

  if (profileError) {
    throw new Error("Failed to record password change time.");
  }

  return createApiResponse({}, "Password changed successfully.");
};

const authServices = {
  register,
  login,
  logout,
  getCurrentUser,
  changePassword,
} as const;

export default authServices;
