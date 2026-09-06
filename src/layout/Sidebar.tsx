import { NavLink, useLocation } from "react-router-dom";
import {
  FaCodeBranch,
  FaSearch,
  FaUserCog,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";
import authHooks from "@/hooks/useAuth";
import { FEATURE_FLAGS as flags } from "@/constants";

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const location = useLocation();
  const { user } = authHooks.useUser();
  const { mutate: logout, isPending: isLoggingOut } = authHooks.useLogout();

  const navigationItems = [
    {
      icon: FaCodeBranch,
      display: flags.BRANCH,
      label: "Branch",
      path: "/branch",
      active: location.pathname.startsWith("/branch"),
    },
    {
      icon: FaSearch,
      display: flags.BRANCH,
      label: "Search Branch",
      path: "/search",
      active: location.pathname.startsWith("/search"),
    },
    {
      icon: FaUserCog,
      display: flags.SETTINGS,
      label: "Settings",
      path: "/settings",
      active: location.pathname.startsWith("/settings"),
    },
  ];

  const displayNavItems = navigationItems.filter((item) => item.display);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="flex h-full w-full flex-col justify-between bg-white select-none">
      {/* Top Header & Navigation */}
      <div className="flex flex-col">
        {/* Brand / Logo */}
        <div className="flex items-center justify-between border-b border-gray-200/80 px-4 py-4">
          <NavLink
            to="/"
            onClick={onClose}
            className="flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 shadow-md shadow-blue-500/20">
              <span className="text-base font-black tracking-wider text-white">
                TR
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-gray-900">
                Talimuddin
              </span>
              <span className="text-[11px] font-medium text-gray-500">
                Institution Management
              </span>
            </div>
          </NavLink>

          {/* Close button for mobile drawer */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 md:hidden transition-colors"
              aria-label="Close sidebar"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="px-3 py-4">
          <div className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
            Navigation
          </div>
          <nav className="space-y-1.5">
            {displayNavItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={index}
                  to={item.path}
                  onClick={onClose}
                  className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                    item.active
                      ? "bg-blue-50 text-blue-700 font-semibold shadow-xs ring-1 ring-blue-500/15"
                      : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      item.active
                        ? "text-blue-600"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Profile & Footer Section */}
      <div className="border-t border-gray-200/80 p-3">
        {user ? (
          <div className="flex flex-col gap-2">
            <NavLink
              to="/settings"
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-100/80"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.full_name}
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-gray-200"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {getInitials(user.full_name)}
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col text-left">
                <span className="truncate text-xs font-semibold text-gray-900">
                  {user.full_name}
                </span>
                <span className="truncate text-[11px] text-gray-500">
                  {user.email}
                </span>
              </div>
            </NavLink>

            <button
              type="button"
              onClick={() => {
                if (onClose) onClose();
                logout();
              }}
              disabled={isLoggingOut}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200/80 bg-red-50/50 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 hover:border-red-300 active:scale-[0.99] disabled:opacity-50"
            >
              <FaSignOutAlt className="h-3.5 w-3.5" />
              <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            onClick={onClose}
            className="flex w-full items-center justify-center rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
          >
            Sign In
          </NavLink>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
