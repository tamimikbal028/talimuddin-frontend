import { NavLink, useLocation } from "react-router-dom";
import { FaCodeBranch, FaSearch } from "react-icons/fa";
import authHooks from "@/hooks/useAuth";
import { FEATURE_FLAGS as flags } from "@/constants";

const TopNavbar = () => {
  const { user } = authHooks.useUser();
  const location = useLocation();

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
  ];

  const displayNavItems = navigationItems.filter((item) => item.display);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/95 shadow-xs backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:h-16 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <NavLink
          to="/"
          className="flex items-center gap-2.5 transition-transform hover:scale-102 active:scale-98"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 shadow-md shadow-blue-500/20 sm:h-10 sm:w-10">
            <span className="text-base font-black tracking-wider text-white sm:text-lg">
              TR
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm leading-tight font-bold tracking-tight text-gray-900 sm:text-base">
              Talimuddin
            </span>
            <span className="text-[10px] font-medium text-gray-500 sm:text-[11px]">
              Institution Management
            </span>
          </div>
        </NavLink>

        {/* Center Navigation Links (Visible on Tablet/Desktop) */}
        <nav className="hidden items-center gap-1 sm:flex sm:gap-2">
          {displayNavItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.path}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                  item.active
                    ? "bg-blue-50 text-blue-600 shadow-xs ring-1 ring-blue-500/15"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    item.active ? "text-blue-600" : "text-gray-500"
                  }`}
                />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right Section: User Profile Link */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <NavLink
              to="/settings"
              className="flex items-center gap-2 rounded-full border border-gray-200/80 bg-gray-50/50 px-3 py-1.5 transition-all hover:bg-gray-100/80 hover:shadow-xs"
            >
              <span className="max-w-30 truncate text-xs font-bold text-gray-800 sm:max-w-none">
                {user.full_name}
              </span>
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
