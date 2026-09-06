import { NavLink, useLocation } from "react-router-dom";
import { FaCodeBranch, FaBars, FaSearch, FaUserCog } from "react-icons/fa";
import authHooks from "@/hooks/useAuth";
import { FEATURE_FLAGS as flags } from "@/constants";

interface MobileTopNavbarProps {
  onToggleSidebar: () => void;
}

const MobileTopNavbar = ({ onToggleSidebar }: MobileTopNavbarProps) => {
  const { isAuthenticated, user } = authHooks.useUser();
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
      label: "Settings",
      display: flags.SETTINGS,
    },
  ];

  const displayNavItems = navItems.filter((item) => item.display);

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-gray-200/80 bg-white/95 px-3 backdrop-blur-md shadow-xs md:hidden">
      {/* Left: Hamburger Button + Brand */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 active:scale-95"
          aria-label="Open sidebar menu"
        >
          <FaBars className="h-4.5 w-4.5" />
        </button>

        <NavLink
          to="/"
          className="flex items-center gap-1.5 transition-transform active:scale-95"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-700 text-xs font-black text-white shadow-xs">
            TR
          </div>
          <span className="text-sm font-bold tracking-tight text-gray-900">
            Talimuddin
          </span>
        </NavLink>
      </div>

      {/* Right: Quick Navigation Options */}
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
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-semibold shadow-xs ring-1 ring-blue-500/15"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 ${
                  isActive ? "text-blue-600" : "text-gray-500"
                }`}
              />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          );
        })}

        {/* User Avatar / Profile pill */}
        {user && (
          <NavLink
            to="/settings"
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700 ring-1 ring-blue-500/20"
            title={user.full_name}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.full_name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              (user.full_name?.[0] || "U").toUpperCase()
            )}
          </NavLink>
        )}
      </nav>
    </header>
  );
};

export default MobileTopNavbar;
