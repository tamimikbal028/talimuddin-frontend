import { NavLink, useParams } from "react-router-dom";
import { FaUsers, FaClipboardList, FaWallet } from "react-icons/fa";
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

  const isManagement = meta?.is_creator || meta?.is_admin;

  // Tabs list
  const tabs = [
    ...(isManagement
      ? [
          {
            path: `${baseUrl}/finance`,
            label: "Finance",
            icon: FaWallet,
            end: false,
          },
        ]
      : []),
    {
      path: `${baseUrl}/members`,
      label: "Members",
      icon: FaUsers,
      count: membersCount,
      end: true,
    },
    {
      path: `${baseUrl}/about`,
      label: "Details",
      icon: FaClipboardList,
      end: true,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-3.5 sm:px-5">
      <nav
        className="hide-scrollbar -mb-px flex items-center justify-center gap-2 overflow-x-auto sm:gap-16"
        aria-label="Branch Navigation"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.end}
              className={({ isActive }) =>
                `group flex shrink-0 items-center gap-2 border-b-2 px-5 py-3 text-xs font-semibold whitespace-nowrap transition-all duration-200 sm:px-10 sm:py-3.5 sm:text-sm ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105" />
                  <span>{tab.label}</span>
                  {typeof tab.count === "number" && (
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold transition-colors ${
                        isActive
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-900"
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
