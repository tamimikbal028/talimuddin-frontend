import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { FaEye, FaEyeSlash, FaBuilding } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import authHooks from "@/hooks/useAuth";

// Zod Schema for Login
const loginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

// TypeScript type infer from Zod schema
type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const { mutate: login, isPending } = authHooks.useLogin();
  const [showPassword, setShowPassword] = useState(false);
  // Ref for focusing password field
  const passwordRef = useRef<HTMLInputElement | null>(null);

  // React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const emailRegister = register("email");
  const passwordRegister = register("password");
  const rememberMeRegister = register("rememberMe");

  // Loading remembered email from localStorage on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      reset({
        email: rememberedEmail,
        password: "qqqqqqQ1",
        rememberMe: true,
      });
      // If email already exists, focus directly on Password field
      setTimeout(() => passwordRef.current?.focus(), 0);
    }
  }, [reset]);

  // Form submit handler
  const onSubmit = (loginData: LoginFormData) => {
    // Remember Me: handle before login
    if (loginData.rememberMe) {
      localStorage.setItem("rememberedEmail", loginData.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    login({
      email: loginData.email,
      password: loginData.password,
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center justify-center gap-2.5 py-1 sm:max-w-md sm:gap-6 sm:py-6 lg:max-w-5xl lg:flex-row lg:gap-16">
      {/* Header - Left Side */}
      <div className="text-center lg:text-left">
        <h1 className="text-2xl font-extrabold text-blue-600 sm:text-4xl lg:mb-2 lg:text-5xl">
          Talimuddin
        </h1>
        <h2 className="hidden text-xl font-semibold text-gray-800 sm:block sm:text-2xl lg:mb-2 lg:text-3xl">
          Welcome Back
        </h2>
        <p className="text-xs text-gray-500 sm:text-sm lg:text-base">
          Sign in to your account to continue
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="w-full max-w-sm sm:max-w-105">
        {/* Form Container */}
        <div className="w-full rounded-2xl border border-gray-100 bg-white p-4.5 shadow-lg sm:p-8 sm:shadow-xl">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-3.5 sm:space-y-6"
          >
            <div className="space-y-2.5 sm:space-y-4">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoFocus // focus by default when new window loads
                  name={emailRegister.name}
                  onChange={emailRegister.onChange}
                  onBlur={emailRegister.onBlur}
                  ref={emailRegister.ref}
                  className={`w-full rounded-lg border px-3 py-2 text-xs transition-colors focus:ring-2 focus:outline-none sm:text-sm ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name={passwordRegister.name}
                    onChange={passwordRegister.onChange}
                    onBlur={passwordRegister.onBlur}
                    // Connecting Ref with Hook Form
                    ref={(e) => {
                      passwordRegister.ref(e);
                      passwordRef.current = e;
                    }}
                    className={`w-full rounded-lg border px-3 py-2 pr-10 text-xs transition-colors focus:ring-2 focus:outline-none sm:text-sm ${
                      errors.password
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    ) : (
                      <FaEye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  name={rememberMeRegister.name}
                  onChange={rememberMeRegister.onChange}
                  onBlur={rememberMeRegister.onBlur}
                  ref={rememberMeRegister.ref}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 sm:h-4 sm:w-4"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-1.5 block text-xs text-gray-700 sm:ml-2 sm:text-sm"
                >
                  Remember me
                </label>
              </div>
              <NavLink
                to="/forgot-password"
                className="text-xs font-medium text-blue-600 hover:text-blue-500 sm:text-sm"
              >
                Forgot password?
              </NavLink>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60 sm:py-2.5 sm:text-sm"
            >
              {isPending ? (
                <div className="flex items-center justify-center">
                  <div className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-b-2 border-white"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Register NavLink */}
          <div className="mt-3 text-center sm:mt-5">
            <p className="text-xs text-gray-600 sm:text-sm">
              Don't have an account?{" "}
              <NavLink
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up here
              </NavLink>
            </p>
          </div>

          {/* Browse Branches (Public Access) */}
          <div className="mt-3 border-t border-gray-100 pt-3 sm:mt-5 sm:pt-5">
            <NavLink
              to="/branch"
              className="group flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200/90 bg-gray-50/70 px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/80 hover:text-blue-700 hover:shadow-xs active:scale-98 sm:py-2.5 sm:text-sm"
            >
              <FaBuilding className="h-3.5 w-3.5 text-blue-600 transition-transform duration-200 group-hover:scale-110 sm:h-4 sm:w-4" />
              <span>View Branches</span>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
