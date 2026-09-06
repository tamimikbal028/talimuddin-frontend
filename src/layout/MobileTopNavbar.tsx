import { NavLink, useLocation } from "react-router-dom";
import {
  FaCodeBranch,
  FaSearch,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import authHooks from "@/hooks/useAuth";
import { FEATURE_FLAGS as flags } from "@/constants";

const MobileTopNavbar = () => {
  const { isAuthenticated } = authHooks.useUser();
  const { mutate: logout, isPending: isLoggingOut } = authHooks.useLogout();
  const location = useLocation();

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    {
      to: "/branch",
      icon: FaCodeBranch,
      label: "Branch",
      display: flags.BRANCH,
    },
    {
      to: "/search",
      icon: FaSearch,
      label: "Search",
      display: flags.BRANCH,
    },
    {
      to: "/settings",
      icon: FaCog,
      label: "Settings",
      display: flags.SETTINGS,
    },
  ];

  const displayNavItems = navItems.filter((item) => item.display);

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-gray-200/80 bg-white/95 px-3 shadow-xs backdrop-blur-md md:hidden">
      {/* Left: Brand */}
      <NavLink
        to="/"
        className="flex items-center gap-2 transition-transform active:scale-95"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-700 text-xs font-black text-white shadow-xs">
          TR
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-gray-900 leading-tight">
            Talimuddin
          </span>
          <span className="text-[10px] font-medium text-gray-500 leading-none">
            Management
          </span>
        </div>
      </NavLink>

      {/* Right: Quick Navigation Options & Logout */}
      <div className="flex items-center gap-1.5">
        <nav className="flex items-center gap-1">
          {displayNavItems.map(({ to, icon: Icon, label }) => {
            const isActive =
              to === "/branch"
                ? location.pathname.startsWith("/branch")
                : location.pathname.startsWith(to);

            return (
              <NavLink
                key={to}
                to={to}
                title={label}
                className={`flex items-center gap-1.5 rounded-lg px-2 sm:px-2.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 font-semibold text-blue-600 shadow-xs ring-1 ring-blue-500/15"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 shrink-0 ${
                    isActive ? "text-blue-600" : "text-gray-500"
                  }`}
                />
                <span className="hidden min-[390px]:inline">{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={() => logout()}
          disabled={isLoggingOut}
          title="Sign Out"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200/80 bg-red-50/60 text-red-600 transition-colors hover:bg-red-100 active:scale-95 disabled:opacity-50"
          aria-label="Sign Out"
        >
          <FaSignOutAlt className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
};

export default MobileTopNavbar;
