import { useState } from "react";
import {
  FaEllipsisH,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
  FaUserShield,
  FaUserCheck,
  FaPhoneAlt,
  FaShareAlt,
  FaWhatsapp,
  FaLink,
  FaEye,
  FaUser,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Branch, BranchMeta } from "@/types";
import branchHooks from "@/hooks/useBranch";
import confirm from "@/utils/sweetAlert";
import dropdownHooks from "@/hooks/useDropdown";
import ManageBranchAdminsModal from "./members/ManageBranchAdminsModal";
import ManageBranchModeratorsModal from "./members/ManageBranchModeratorsModal";

interface BranchHeaderProps {
  branch: Branch;
  meta: BranchMeta;
}

const BranchHeader = ({ branch, meta }: BranchHeaderProps) => {
  const navigate = useNavigate();
  const [isManageAdminsModalOpen, setIsManageAdminsModalOpen] = useState(false);
  const [isManageModeratorsModalOpen, setIsManageModeratorsModalOpen] =
    useState(false);

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

  const {
    isOpen: showShareMenu,
    openUpward: openShareUpward,
    menuRef: shareMenuRef,
    triggerRef: shareButtonRef,
    toggle: toggleShareMenu,
    close: closeShareMenu,
  } = dropdownHooks.useDropdown();

  const handleWhatsAppShare = () => {
    closeShareMenu();
    const text = `Check out ${branch.name} on Talimuddin:\n${window.location.href}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    closeShareMenu();
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Branch link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const handleNativeShare = async () => {
    closeShareMenu();
    try {
      await navigator.share({
        title: branch.name,
        text: `Check out ${branch.name} on Talimuddin Academy`,
        url: window.location.href,
      });
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") {
        console.error("Native share failed", err);
      }
    }
  };

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

          {/* Action Buttons: Share + 3-dot Menu */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Share Menu */}
            <div className="relative" ref={shareMenuRef}>
              <button
                ref={shareButtonRef}
                onClick={toggleShareMenu}
                className="group flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200/80 bg-white px-2.5 text-xs font-semibold text-gray-700 shadow-2xs transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/80 hover:text-blue-600 hover:shadow-xs active:scale-95 sm:h-10 sm:px-3.5 sm:text-sm"
                title="Share branch"
              >
                <FaShareAlt className="h-3.5 w-3.5 text-blue-600 transition-transform duration-200 group-hover:scale-110" />
                <span className="hidden sm:inline">Share</span>
              </button>

              {showShareMenu && (
                <div
                  className={`absolute right-0 z-50 w-48 rounded-2xl border border-gray-200/90 bg-white p-1.5 shadow-xl ${
                    openShareUpward ? "bottom-full mb-2" : "top-full mt-2"
                  } animate-in fade-in zoom-in-95 duration-150`}
                >
                  <div className="space-y-0.5">
                    {/* Share on WhatsApp */}
                    <button
                      type="button"
                      onClick={handleWhatsAppShare}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-gray-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <FaWhatsapp className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span>Share on WhatsApp</span>
                    </button>

                    {/* Copy Link */}
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                    >
                      <FaLink className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                      <span>Copy Link</span>
                    </button>

                    {/* Native Share on supported devices */}
                    {hasNativeShare && (
                      <button
                        type="button"
                        onClick={handleNativeShare}
                        className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-gray-700 transition-colors hover:bg-purple-50 hover:text-purple-700"
                      >
                        <FaShareAlt className="h-3.5 w-3.5 shrink-0 text-purple-600" />
                        <span>More Options...</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 3-dot Action Menu */}
            {(meta.is_admin || meta.is_admin_user) && (
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
                    className={`absolute right-0 z-50 w-56 rounded-2xl border border-gray-200/90 bg-white p-1.5 shadow-xl ${
                      openUpward ? "bottom-full mb-2" : "top-full mt-2"
                    } animate-in fade-in zoom-in-95 duration-150`}
                  >
                    <div className="space-y-0.5">
                      {meta.is_admin_user && (
                        <button
                          type="button"
                          onClick={() => {
                            closeMenu();
                            setIsManageAdminsModalOpen(true);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                        >
                          <FaUserShield className="h-4 w-4 shrink-0 text-blue-600" />
                          <span>Manage Branch Admins</span>
                        </button>
                      )}

                      {meta.is_admin && (
                        <button
                          type="button"
                          onClick={() => {
                            closeMenu();
                            setIsManageModeratorsModalOpen(true);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-medium text-gray-700 transition-colors hover:bg-purple-50 hover:text-purple-700"
                        >
                          <FaUserCheck className="h-4 w-4 shrink-0 text-purple-600" />
                          <span>Manage Branch Moderators</span>
                        </button>
                      )}

                      {(meta.is_admin || meta.is_admin_user) && (
                        <Link
                          to={`/branch/branches/${branch.id}/edit`}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                          onClick={closeMenu}
                        >
                          <FaEdit className="h-4 w-4 shrink-0 text-gray-500" />
                          <span>Edit Branch</span>
                        </Link>
                      )}

                      {meta.is_admin_user && (
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
        </div>

        {/* Row 2: Badges (Branch Type + Location) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Branch Type Badge */}
          {branch.branch_type === "SUB" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200/90 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 shadow-2xs">
              Sub Branch
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/90 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-2xs">
              Main Branch
            </span>
          )}

          {/* User Branch Role Badge */}
          {meta.is_admin ? (
            <span
              title="You are a Branch Admin of this branch"
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/90 px-3 py-1 text-xs font-medium text-blue-800 shadow-2xs"
            >
              <FaUserShield className="h-3 w-3 text-blue-600" />
              <span>
                Role: <strong className="font-bold">Admin</strong>
              </span>
            </span>
          ) : meta.is_moderator ? (
            <span
              title="You are a Moderator of this branch"
              className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50/90 px-3 py-1 text-xs font-medium text-purple-800 shadow-2xs"
            >
              <FaUserCheck className="h-3 w-3 text-purple-600" />
              <span>
                Role: <strong className="font-bold">Moderator</strong>
              </span>
            </span>
          ) : meta.is_admin_user ? (
            <span
              title="You are viewing as an App Administrator"
              className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/90 px-3 py-1 text-xs font-medium text-indigo-800 shadow-2xs"
            >
              <FaUserShield className="h-3 w-3 text-indigo-600" />
              <span>
                Role: <strong className="font-bold">App Admin</strong>
              </span>
            </span>
          ) : meta.is_member ? (
            <span
              title="You are a Member of this branch"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1 text-xs font-medium text-emerald-800 shadow-2xs"
            >
              <FaUser className="h-3 w-3 text-emerald-600" />
              <span>
                Role: <strong className="font-bold">Member</strong>
              </span>
            </span>
          ) : (
            <span
              title="You are viewing this branch as a guest"
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50/90 px-3 py-1 text-xs font-medium text-amber-800 shadow-2xs"
            >
              <FaEye className="h-3 w-3 text-amber-600" />
              <span>
                Role: <strong className="font-bold">Guest View</strong>
              </span>
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
            <p className="w-full text-xs leading-relaxed whitespace-pre-line text-gray-600 sm:text-sm">
              {branch.description}
            </p>
          </div>
        )}
      </div>

      {/* App Admin: Manage Branch Admins Modal (View, Remove & Add) */}
      <ManageBranchAdminsModal
        isOpen={isManageAdminsModalOpen}
        onClose={() => setIsManageAdminsModalOpen(false)}
        branchName={branch.name}
      />

      {/* Branch Admin: Manage Branch Moderators Modal (View, Remove & Add) */}
      <ManageBranchModeratorsModal
        isOpen={isManageModeratorsModalOpen}
        onClose={() => setIsManageModeratorsModalOpen(false)}
        branchName={branch.name}
      />
    </div>
  );
};

export default BranchHeader;
