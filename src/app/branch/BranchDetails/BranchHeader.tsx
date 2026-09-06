import { FaEllipsisH, FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import type { Branch, BranchMeta } from "@/types";
import branchHooks from "@/hooks/useBranch";
import confirm from "@/utils/sweetAlert";
import BranchDetailsNavBar from "@/app/branch/BranchDetails/BranchDetailsNavBar";
import dropdownHooks from "@/hooks/useDropdown";

interface BranchHeaderProps {
  branch: Branch;
  meta: BranchMeta;
}

const BranchHeader = ({ branch, meta }: BranchHeaderProps) => {
  const navigate = useNavigate();

  const { mutate: deleteBranch, isPending: isDeleting } =
    branchHooks.useDeleteBranch();

  const {
    isOpen: showMenu,
    openUpward,
    menuRef,
    triggerRef: buttonRef,
    toggle: toggleMenu,
    close: closeMenu,
  } = dropdownHooks.useDropdown();

  const handleDelete = async () => {
    closeMenu();
    const ok = await confirm({
      title: "Delete Branch?",
      text: "Are you sure you want to delete this branch? This action cannot be undone.",
      confirmButtonText: "Yes, delete",
      confirmButtonColor: "#d33",
      isDanger: true,
    });

    if (ok) {
      deleteBranch(branch.id);
    }
  };

  return (
    <div>
      {/* Header Content */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl space-y-3 p-3.5 sm:p-5">
          {/* Row 1: Back + Name (truncated) + 3-dot menu directly to right */}
          <div className="flex items-center justify-between gap-2.5 sm:gap-3">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate("/branch")}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-all hover:bg-gray-200 active:scale-95 sm:h-9 sm:w-9"
                title="Go back to branches"
              >
                <FaArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
              <h1
                className="min-w-0 truncate text-xl leading-snug font-bold text-gray-900 sm:text-3xl"
                title={branch.name}
              >
                {branch.name}
              </h1>
            </div>
            {/* 3-dot action menu right next to branch name */}
            {(meta.is_creator || meta.is_admin) && (
              <div
                className="relative shrink-0 rounded-lg border border-gray-300"
                ref={menuRef}
              >
                <button
                  ref={buttonRef}
                  onClick={toggleMenu}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-200 sm:h-8 sm:w-8"
                  title="More actions"
                >
                  <FaEllipsisH className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>

                {showMenu && (
                  <div
                    className={`absolute left-0 z-50 w-56 rounded-lg border border-gray-200 bg-white shadow-lg sm:right-0 sm:left-auto ${
                      openUpward ? "bottom-full mb-1" : "top-full mt-1"
                    }`}
                  >
                    <div className="py-1">
                      {(meta.is_creator || meta.is_admin) && (
                        <Link
                          to={`/branch/branches/${branch.id}/edit`}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                          onClick={closeMenu}
                        >
                          <FaEdit className="h-4 w-4 shrink-0" />
                          <span className="font-medium">Edit Branch</span>
                        </Link>
                      )}

                      {meta.is_creator && (
                        <button
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FaTrash className="h-4 w-4 shrink-0" />
                          <span className="font-medium">
                            {isDeleting ? "Deleting..." : "Delete Branch"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Row 2: Badges & Member Count */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Branch Type Badge */}
            {branch.branch_type === "SUB" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700 sm:px-3 sm:py-1">
                Sub Branch
                {branch.parent_branch?.name && (
                  <span className="font-normal text-purple-500">
                    ({branch.parent_branch.name})
                  </span>
                )}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 sm:px-3 sm:py-1">
                Main Branch
              </span>
            )}

            {/* Separator */}
            <span className="text-gray-400">•</span>

            {/* Members Count */}
            <span className="text-xs font-medium text-gray-600 sm:text-sm">
              <span className="font-semibold text-gray-900">
                {(branch.members_count || 0).toLocaleString()}
              </span>{" "}
              {(branch.members_count || 0) <= 1 ? "Member" : "Members"}
            </span>
          </div>

          {/* Row 2: Description */}
          <div className="mt-3">
            <p
              className={
                branch.description
                  ? "text-xs leading-relaxed text-gray-700 sm:text-sm"
                  : "text-xs font-medium text-gray-500 italic sm:text-sm"
              }
            >
              {branch.description}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div>
          <BranchDetailsNavBar meta={meta} />
        </div>
      </div>
    </div>
  );
};

export default BranchHeader;
