import { NavLink, useParams } from "react-router-dom";
import { FaUsers, FaWallet } from "react-icons/fa";
import type { BranchMeta } from "@/types/branch.types";

interface BranchDetailsNavBarProps {
  meta?: BranchMeta;
  membersCount?: number;
}

const BranchDetailsNavBar = ({
  meta,
  membersCount,
}: BranchDetailsNavBarProps) => {
  const { branchId } = useParams<{ branchId: string }>();
  const baseUrl = `/branch/branches/${branchId}`;

  const isMember =
    meta?.is_member ||
    meta?.is_admin_user ||
    meta?.is_admin ||
    meta?.is_moderator;
  const isManagement =
    meta?.is_admin || meta?.is_admin_user || meta?.is_moderator;

  // Tabs list:
  // Admins see "Finance" and "Students"
  // Members see "Students"
  // Guests see NO tabs
  const tabs = [
    ...(isManagement
      ? [
          {
            path: `${baseUrl}/finance`,
            label: "Finance",
            icon: FaWallet,
            end: false,
            display: true,
          },
        ]
      : []),
    ...(isMember
      ? [
          {
            path: `${baseUrl}/members`,
            label: "Students",
            icon: FaUsers,
            count: membersCount,
            end: true,
            display: true,
          },
        ]
      : []),
  ];

  const visibleTabs = tabs.filter((tab) => tab.display);

  if (visibleTabs.length === 0) {
    return null;
  }

  return (
    <div>
      <nav
        className="mx-auto flex w-full items-center gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-xs"
        aria-label="Branch Navigation"
      >
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.end}
              className={({ isActive }) =>
                `group flex flex-1 items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm ${
                  isActive
                    ? "border-blue-200 bg-blue-50 text-blue-700 shadow-xs"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:scale-105 sm:h-4 sm:w-4" />
                  <span>{tab.label}</span>
                  {typeof tab.count === "number" && (
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold transition-colors sm:px-2 sm:text-xs ${
                        isActive
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 group-hover:text-gray-900"
                      }`}
                    >
                      {tab.count.toLocaleString()}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default BranchDetailsNavBar;
