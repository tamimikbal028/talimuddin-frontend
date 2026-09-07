import { useState } from "react";
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
import dropdownHooks from "@/hooks/useDropdown";
import AddBranchAdminModal from "./AddBranchAdminModal";

interface BranchHeaderProps {
  branch: Branch;
  meta: BranchMeta;
}

const BranchHeader = ({ branch, meta }: BranchHeaderProps) => {
  const navigate = useNavigate();
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);

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
    <div className="relative border-b border-gray-200/90 bg-linear-to-b from-blue-50/80 via-slate-50/50 to-white shadow-2xs">
      <div className="mx-auto max-w-5xl space-y-3.5 p-4 sm:p-6">
        {/* Top Row: Back Button + Title + Actions */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => navigate("/branch")}
              className="group flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-gray-200/80 bg-white text-gray-600 shadow-2xs transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/80 hover:text-blue-600 hover:shadow-xs active:scale-95 sm:h-10 sm:w-10"
              title="Go back to branches"
            >
              <FaArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <div className="min-w-0">
              <h1
                className="truncate text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl md:text-3xl"
                title={branch.name}
              >
                {branch.name}
              </h1>
            </div>
          </div>

          {/* 3-dot Action Menu */}
          {(meta.is_creator || meta.is_admin || meta.is_admin_user) && (
            <div className="relative shrink-0" ref={menuRef}>
              <button
                ref={buttonRef}
                onClick={toggleMenu}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-gray-200/80 bg-white text-gray-600 shadow-2xs transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 hover:shadow-xs active:scale-95 sm:h-10 sm:w-10"
                title="More actions"
              >
                <FaEllipsisH className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>

              {showMenu && (
                <div
                  className={`absolute right-0 z-50 w-52 rounded-2xl border border-gray-200/90 bg-white p-1.5 shadow-xl ${
                    openUpward ? "bottom-full mb-2" : "top-full mt-2"
                  } animate-in fade-in zoom-in-95 duration-150`}
                >
                  <div className="space-y-0.5">
                    {meta.is_admin_user && (
                      <button
                        type="button"
                        onClick={() => {
                          closeMenu();
                          setIsAddAdminModalOpen(true);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                      >
                        <FaUserShield className="h-4 w-4 shrink-0 text-blue-600" />
                        <span>Add Branch Admin</span>
                      </button>
                    )}

                    {(meta.is_creator || meta.is_admin) && (
                      <Link
                        to={`/branch/branches/${branch.id}/edit`}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                        onClick={closeMenu}
                      >
                        <FaEdit className="h-4 w-4 shrink-0 text-gray-500" />
                        <span>Edit Branch</span>
                      </Link>
                    )}

                    {(meta.is_creator || meta.is_admin_user) && (
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FaTrash className="h-4 w-4 shrink-0 text-red-500" />
                        <span>
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

        {/* Row 2: Badges (Branch Type + Location) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Branch Type Badge */}
          {branch.branch_type === "SUB" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200/90 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
              Sub Branch
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/90 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Main Branch
            </span>
          )}

          {/* Sub Branch Parent Link */}
          {branch.branch_type === "SUB" && branch.parent_branch?.name && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-2xs">
              Parent:
              <Link
                to={`/branch/branches/${branch.parent_branch.id}`}
                className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                {branch.parent_branch.name}
              </Link>
            </span>
          )}

          {/* Location Chip */}
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
                className="group inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-2xs transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 hover:shadow-xs active:scale-95"
              >
                <FaMapMarkerAlt className="h-3 w-3 shrink-0 text-rose-500 transition-transform duration-200 group-hover:scale-110" />
                <span className="max-w-40 truncate font-semibold sm:max-w-64">
                  {branch.location_name || "View on Map"}
                </span>
                <FaExternalLinkAlt className="h-2.5 w-2.5 shrink-0 text-gray-400 group-hover:text-blue-500" />
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-2xs">
                <FaMapMarkerAlt className="h-3 w-3 shrink-0 text-rose-500" />
                <span className="max-w-40 truncate font-semibold sm:max-w-64">
                  {branch.location_name}
                </span>
              </span>
            ))}
        </div>

        {/* Row 3: Admin Contacts */}
        {branch.admin_info && branch.admin_info.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {branch.admin_info.map((admin, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200/90 bg-white/90 px-3 py-1.5 text-xs shadow-2xs backdrop-blur-xs transition-all duration-200 hover:border-blue-200 hover:shadow-xs"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <FaUserShield className="h-2.5 w-2.5" />
                </div>
                <span className="font-semibold text-gray-900">
                  {admin.name}
                </span>
                {admin.number && (
                  <>
                    <span className="text-gray-300">|</span>
                    <a
                      href={`tel:${admin.number}`}
                      className="inline-flex items-center gap-1 rounded-md border border-emerald-200/70 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 transition-colors hover:bg-emerald-100 hover:text-emerald-800 active:scale-95"
                      title={`Call ${admin.name}`}
                    >
                      <FaPhoneAlt className="h-2 w-2 text-emerald-600" />
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
          <div className="pt-1">
            <p className="max-w-3xl text-xs leading-relaxed text-gray-600 sm:text-sm">
              {branch.description}
            </p>
          </div>
        )}
      </div>

      {/* App Admin: Add Branch Admin Modal */}
      <AddBranchAdminModal
        isOpen={isAddAdminModalOpen}
        onClose={() => setIsAddAdminModalOpen(false)}
        branchName={branch.name}
      />
    </div>
  );
};

export default BranchHeader;
