import { NavLink, useLocation } from "react-router-dom";
import { FaCodeBranch, FaSearch, FaUserCog } from "react-icons/fa";
import authHooks from "@/hooks/useAuth";
import { FEATURE_FLAGS as flags } from "@/constants";

const MobileBottomNavbar = () => {
  const { isAuthenticated } = authHooks.useUser();
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
      icon: FaUserCog,
      label: "Profile",
      display: true,
    },
  ];

  const displayNavItems = navItems.filter((item) => item.display);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 w-full items-center justify-around border-t border-gray-200/80 bg-white/95 px-2 backdrop-blur-md shadow-lg sm:hidden">
      {displayNavItems.map(({ to, icon: Icon, label }) => {
        const isActive = to === "/branch"
          ? location.pathname.startsWith("/branch")
          : location.pathname.startsWith(to);

        return (
          <NavLink
            key={to}
            to={to}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all ${
              isActive
                ? "font-bold text-blue-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <div
              className={`flex h-8 w-12 items-center justify-center rounded-full transition-colors ${
                isActive ? "bg-blue-50" : "bg-transparent"
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold">{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileBottomNavbar;
