import { NavLink, useLocation } from "react-router-dom";
import { FaCodeBranch, FaSearch, FaCog, FaSignOutAlt } from "react-icons/fa";
import authHooks from "@/hooks/useAuth";
import { FEATURE_FLAGS as flags } from "@/constants";

const Sidebar = () => {
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
      icon: FaCog,
      display: flags.SETTINGS,
      label: "Settings",
      path: "/settings",
      active: location.pathname.startsWith("/settings"),
    },
  ];

  const displayNavItems = navigationItems.filter((item) => item.display);

  return (
    <aside className="flex h-full w-full flex-col justify-between bg-white select-none">
      {/* Top Header & Navigation */}
      <div className="flex flex-col">
        {/* Brand / Logo */}
        <div className="flex items-center justify-between border-b border-gray-200/80 px-4 py-4">
          <NavLink
            to="/"
            className="flex items-center gap-3 transition-transform hover:scale-[1.01]"
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
        </div>

        {/* Navigation Links */}
        <div className="px-3 py-4">
          <nav className="space-y-1.5">
            {displayNavItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={index}
                  to={item.path}
                  className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                    item.active
                      ? "bg-blue-50 font-semibold text-blue-700 shadow-xs ring-1 ring-blue-500/15"
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

      {/* Sign Out / Footer Section */}
      <div className="border-t border-gray-200/80 p-3">
        {user ? (
          <button
            type="button"
            onClick={() => logout()}
            disabled={isLoggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200/80 bg-red-50/50 py-2.5 text-xs font-semibold text-red-600 transition-colors hover:border-red-300 hover:bg-red-100 active:scale-[0.99] disabled:opacity-50"
          >
            <FaSignOutAlt className="h-3.5 w-3.5" />
            <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        ) : (
          <NavLink
            to="/login"
            className="flex w-full items-center justify-center rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
          >
            Sign In
          </NavLink>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
