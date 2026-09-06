import {
  lazy,
  createElement,
  type ComponentType,
  type LazyExoticComponent,
} from "react";
import Login from "@/app/auth/login/page";
import Register from "@/app/auth/register/page";
import { FEATURE_FLAGS } from "@/constants/featureFlags";
import { Navigate } from "react-router-dom";

// Enhanced Route configuration - Industry standard approach
interface RouteConfig {
  path: string;
  Component: LazyExoticComponent<ComponentType> | ComponentType;
  requireAuth: boolean;
  title: string;
  preload?: boolean;
  category?: string;
  display: boolean;
  meta?: {
    description?: string;
    keywords?: string[];
    ogTitle?: string;
  };
}

export const routes: RouteConfig[] = [
  // Public routes
  {
    path: "/login",
    display: true,
    Component: Login,
    requireAuth: false,
    title: "Login",
    category: "auth",
    meta: {
      description: "Login to your account",
      keywords: ["login", "signin"],
    },
  },
  {
    path: "/register",
    display: true,
    Component: Register,
    requireAuth: false,
    title: "Register",
    category: "auth",
    meta: {
      description: "Create a new account",
      keywords: ["register", "signup"],
    },
  },

  // Core app routes
  {
    path: "/",
    display: true,
    Component: () =>
      createElement(Navigate, { to: "/branch", replace: true }),
    requireAuth: true,
    title: "Home",
    preload: true,
    category: "main",
    meta: { description: "Your dashboard" },
  },
  {
    path: "/branch/*",
    display: FEATURE_FLAGS.BRANCH,
    Component: lazy(() => import("../app/branch/page")),
    requireAuth: true,
    title: "Branch",
    category: "management",
    meta: { description: "Attend and manage branches" },
  },
  {
    path: "/search",
    display: FEATURE_FLAGS.BRANCH,
    Component: lazy(() => import("../app/search/page")),
    requireAuth: true,
    title: "Search Branch",
    category: "management",
    meta: { description: "Search branches" },
  },

  // Settings routes
  {
    path: "/settings",
    display: FEATURE_FLAGS.SETTINGS,
    Component: lazy(() => import("../app/settings/page")),
    requireAuth: true,
    title: "Settings",
    category: "utility",
    meta: { description: "Account and app settings" },
  },

  // 404 route
  {
    path: "*",
    display: false,
    Component: lazy(() => import("@/app/shared/NotFound")),
    requireAuth: false,
    title: "Page Not Found",
    category: "error",
    meta: { description: "The page you're looking for doesn't exist" },
  },
];

export const getRouteByPath = (path: string) =>
  routes.find((route) => route.path === path);
