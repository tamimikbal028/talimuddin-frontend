import { BsThreeDots } from "react-icons/bs";
import { FaUserMinus } from "react-icons/fa";
import { HiPencilSquare, HiPhone, HiMapPin } from "react-icons/hi2";
import branchHooks from "@/hooks/useBranch";
import confirm from "@/utils/sweetAlert";
import dropdownHooks from "@/hooks/useDropdown";
import type { BranchMember } from "@/types";
import { AvatarImage } from "@/utils/components/FallbackImage";

interface BranchMemberCardProps {
  member: BranchMember;
  onEdit?: (member: BranchMember) => void;
}

const BranchMemberCard = ({ member, onEdit }: BranchMemberCardProps) => {
  const { user, meta } = member;
  const isManual = meta.is_manual ?? !user?.id;
  const memberName = member.name || user?.full_name || "Member";

  const {
    isOpen: showMenu,
    openUpward,
    menuRef,
    triggerRef: buttonRef,
    toggle: toggleMenu,
    close: closeMenu,
  } = dropdownHooks.useDropdown();

  // Branch management mutations
  const { mutate: removeMember } = branchHooks.useRemoveBranchMember();

  // Check if 3-dot menu should show
  const canManage = meta.can_manage;

  const handleRemove = async () => {
    closeMenu();
    const ok = await confirm({
      title: "Remove Member?",
      text: `${memberName} will be removed from this branch.`,
      confirmButtonText: "Yes, remove",
      icon: "warning",
    });
    if (ok) {
      removeMember({
        memberId: meta.member_id,
        userId: user?.id || undefined,
      });
    }
  };

  const getRoleBadge = () => {
    if (meta.is_creator) {
      return (
        <span className="shrink-0 rounded-full border border-purple-200/90 bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 shadow-2xs">
          Creator
        </span>
      );
    }
    if (meta.is_admin) {
      return (
        <span className="shrink-0 rounded-full border border-indigo-200/90 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 shadow-2xs">
          Admin
        </span>
      );
    }
    return null;
  };

  return (
    <div
      className={`group flex items-center justify-between rounded-2xl border p-3.5 shadow-xs transition-all duration-200 hover:shadow-md sm:p-4 ${
        meta.is_self
          ? "border-blue-300 bg-white ring-2 ring-blue-500/10 hover:border-blue-400"
          : "border-gray-200/90 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex min-w-0 items-center space-x-3.5 sm:space-x-4">
        <AvatarImage
          src={user?.avatar}
          name={memberName}
          alt={memberName}
          className="h-11 w-11 shrink-0 rounded-2xl object-cover shadow-xs ring-2 ring-gray-100 sm:h-12 sm:w-12"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {member.serial_no != null && (
              <span className="shrink-0 rounded-md border border-slate-200/90 bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-slate-700 shadow-2xs">
                #{member.serial_no}
              </span>
            )}
            <span className="text-sm font-bold tracking-tight text-gray-900 sm:text-base">
              {memberName}
            </span>
            {member.blood_group && (
              <span className="shrink-0 rounded-md border border-rose-200/90 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 shadow-2xs">
                {member.blood_group}
              </span>
            )}
            {getRoleBadge()}
            {meta.is_self && (
              <span className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                You
              </span>
            )}
          </div>

          {isManual ? (
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
              {member.phone && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200/70 bg-gray-50/80 px-2.5 py-1 text-xs font-medium text-gray-700">
                  <HiPhone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  {member.phone}
                </span>
              )}
              {member.address && (
                <span
                  className="inline-flex max-w-75 items-center gap-1.5 truncate rounded-lg border border-gray-200/70 bg-gray-50/80 px-2.5 py-1 text-xs text-gray-600"
                  title={member.address}
                >
                  <HiMapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  <span className="truncate">{member.address}</span>
                </span>
              )}
            </div>
          ) : (
            <div className="mt-1.5 flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200/70 bg-gray-50/80 px-2.5 py-1 text-xs font-medium text-gray-600">
                @{user?.user_name || "user"}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-2">
        {/* 3-dot dropdown menu */}
        {canManage && (
          <div className="relative" ref={menuRef}>
            <button
              ref={buttonRef}
              onClick={toggleMenu}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              title="More actions"
            >
              <BsThreeDots className="h-5 w-5" />
            </button>

            {showMenu && (
              <div
                className={`absolute right-0 z-50 w-52 rounded-xl border border-gray-200 bg-white p-1 shadow-xl ${
                  openUpward ? "bottom-full mb-1" : "top-full mt-1"
                } animate-in fade-in zoom-in duration-150`}
              >
                {/* Edit action for manual members (or if onEdit provided) */}
                {onEdit && (
                  <button
                    onClick={() => {
                      closeMenu();
                      onEdit(member);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    <HiPencilSquare className="h-4 w-4 shrink-0 text-blue-500" />
                    <span>Edit Details</span>
                  </button>
                )}

                {/* Remove action */}
                <button
                  onClick={handleRemove}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <FaUserMinus className="h-4 w-4 shrink-0 text-red-500" />
                  <span>Remove from Branch</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchMemberCard;
