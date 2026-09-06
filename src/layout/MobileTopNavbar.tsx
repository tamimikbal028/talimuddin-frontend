import { NavLink, useLocation } from "react-router-dom";
import { FaCodeBranch, FaBars, FaSearch } from "react-icons/fa";
import authHooks from "@/hooks/useAuth";
import { FEATURE_FLAGS as flags } from "@/constants";

interface MobileTopNavbarProps {
  onToggleSidebar: () => void;
}

const MobileTopNavbar = ({ onToggleSidebar }: MobileTopNavbarProps) => {
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
  ];

  const displayNavItems = navItems.filter((item) => item.display);

  return (
    <nav className="flex h-14 w-full items-center justify-around border-b border-gray-200 bg-white shadow-sm">
      {/* Menu / Hamburger Button to toggle sidebar */}
      <button
        onClick={onToggleSidebar}
        className="flex cursor-pointer flex-col items-center gap-0.5 px-3 py-1 text-gray-500 transition-all hover:text-blue-500 active:scale-95"
        aria-label="Open menu"
      >
        <FaBars className="h-5 w-5" />
        <span className="text-[10px] font-medium">Menu</span>
      </button>

      {displayNavItems.map(({ to, icon: Icon, label }) => {
        return (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => {
              const isItemActive =
                to === "/branch"
                  ? location.pathname.startsWith("/branch")
                  : isActive;

              return `flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                isItemActive
                  ? "font-semibold text-blue-600"
                  : "text-gray-500 hover:text-blue-500"
              }`;
            }}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileTopNavbar;
