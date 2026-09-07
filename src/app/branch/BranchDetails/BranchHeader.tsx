import {
  FaEllipsisH,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
  FaUserShield,
  FaPhoneAlt,
} from "react-icons/fa";
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
                    className={`absolute right-0 z-50 w-48 rounded-xl border border-gray-200 bg-white shadow-xl ${
                      openUpward ? "bottom-full mb-1" : "top-full mt-1"
                    } animate-in fade-in zoom-in-95 duration-150`}
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

          {/* Row 2: Badges */}
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

            {/* Location Badge */}
            {(branch.location_name || branch.location_url) &&
              (branch.location_url ? (
                <a
                  href={
                    branch.location_url.startsWith("http://") ||
                    branch.location_url.startsWith("https://")
                      ? branch.location_url
                      : `https://${branch.location_url}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Open location: ${branch.location_name || "Map"}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-700 shadow-2xs transition-all hover:border-blue-400 hover:bg-blue-50/70 hover:text-blue-700 hover:shadow-xs active:scale-95"
                >
                  <FaMapMarkerAlt className="h-3 w-3 shrink-0 text-red-500" />
                  <span className="max-w-35 truncate font-semibold sm:max-w-50">
                    {branch.location_name || "View Location"}
                  </span>
                  <FaExternalLinkAlt className="h-2.5 w-2.5 shrink-0 text-gray-400" />
                </a>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-700 shadow-2xs">
                  <FaMapMarkerAlt className="h-3 w-3 shrink-0 text-red-500" />
                  <span className="max-w-35 truncate font-semibold sm:max-w-50">
                    {branch.location_name}
                  </span>
                </span>
              ))}
          </div>

          {/* Row 3: Admin Info (displayed below type & location if present) */}
          {branch.admin_info && branch.admin_info.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {branch.admin_info.map((admin, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50/90 px-2.5 py-1 text-xs text-gray-800 shadow-2xs"
                >
                  <FaUserShield className="h-3 w-3 shrink-0 text-blue-600" />
                  <span className="font-semibold text-gray-900">
                    {admin.name}
                  </span>
                  {admin.number && (
                    <>
                      <span className="text-gray-300">•</span>
                      <a
                        href={`tel:${admin.number}`}
                        className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        title={`Call ${admin.name}`}
                      >
                        <FaPhoneAlt className="h-2.5 w-2.5" />
                        <span>{admin.number}</span>
                      </a>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Row 4: Description */}
          {branch.description && (
            <div className="mt-3">
              <p className="text-xs leading-relaxed text-gray-700 sm:text-sm">
                {branch.description}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div>
          <BranchDetailsNavBar
            meta={meta}
            membersCount={branch.members_count}
          />
        </div>
      </div>
    </div>
  );
};

export default BranchHeader;
