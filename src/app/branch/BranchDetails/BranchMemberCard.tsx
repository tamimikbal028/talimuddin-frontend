import { BsThreeDots } from "react-icons/bs";
import { FaUserShield, FaUserMinus } from "react-icons/fa";
import { HiPencilSquare, HiPhone } from "react-icons/hi2";
import branchHooks from "@/hooks/useBranch";
import confirm from "@/utils/sweetAlert";
import dropdownHooks from "@/hooks/useDropdown";
import type { BranchMember } from "@/types";
import { AvatarImage } from "@/utils/components/FallbackImage";

interface BranchMemberCardProps {
  member: BranchMember;
  isCreator?: boolean;
  onEdit?: (member: BranchMember) => void;
}

const BranchMemberCard = ({
  member,
  isCreator = false,
  onEdit,
}: BranchMemberCardProps) => {
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
  const { mutate: promoteMember } = branchHooks.usePromoteBranchMember();
  const { mutate: demoteMember } = branchHooks.useDemoteBranchMember();

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

  const handlePromote = async () => {
    closeMenu();
    if (!user?.id) return;
    const ok = await confirm({
      title: "Make Admin?",
      text: `${memberName} will be promoted to admin.`,
      confirmButtonText: "Yes, promote",
      icon: "info",
    });
    if (ok) {
      promoteMember({ userId: user.id });
    }
  };

  const handleDemote = async () => {
    closeMenu();
    if (!user?.id) return;
    const ok = await confirm({
      title: "Demote Admin?",
      text: `${memberName} will be demoted to member.`,
      confirmButtonText: "Yes, demote",
      icon: "warning",
    });
    if (ok) {
      demoteMember({ userId: user.id });
    }
  };

  const getRoleBadge = () => {
    if (meta.is_creator) {
      return (
        <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
          Creator
        </span>
      );
    }
    if (meta.is_admin) {
      return (
        <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
          Admin
        </span>
      );
    }
    return null;
  };

  return (
    <div
      className={`flex items-center justify-between rounded-xl border p-3 shadow-xs transition-all hover:shadow-sm ${
        meta.is_self
          ? "border-blue-200 bg-blue-50/50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex min-w-0 items-center space-x-3.5">
        <AvatarImage
          src={user?.avatar}
          name={memberName}
          alt={memberName}
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0">
          <h3 className="flex items-center gap-1 truncate">
            <span className="truncate text-sm font-semibold text-gray-800">
              {memberName}
            </span>
            {getRoleBadge()}
          </h3>

          {isManual ? (
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-gray-500">
              {member.phone && (
                <span className="inline-flex items-center gap-1 font-medium text-gray-600">
                  <HiPhone className="h-3 w-3 text-gray-400" />
                  {member.phone}
                </span>
              )}
              {member.blood_group && (
                <span className="py-0.2 rounded bg-rose-50 px-1.5 text-[10px] font-semibold text-rose-600">
                  {member.blood_group}
                </span>
              )}
              {member.address && (
                <span className="hidden max-w-36 truncate text-gray-400 sm:inline">
                  • {member.address}
                </span>
              )}
            </div>
          ) : (
            <p className="truncate text-xs text-gray-500">
              @{user?.user_name || "user"}
            </p>
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

                {/* Creator-only actions for registered users: Promote/Demote */}
                {isCreator && !isManual && user?.id && (
                  <>
                    {!meta.is_admin && (
                      <button
                        onClick={handlePromote}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        <FaUserShield className="h-4 w-4 shrink-0 text-blue-500" />
                        <span>Make Admin</span>
                      </button>
                    )}
                    {meta.is_admin && !meta.is_creator && (
                      <button
                        onClick={handleDemote}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        <FaUserMinus className="h-4 w-4 shrink-0 text-orange-500" />
                        <span>Demote to Member</span>
                      </button>
                    )}
                  </>
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
