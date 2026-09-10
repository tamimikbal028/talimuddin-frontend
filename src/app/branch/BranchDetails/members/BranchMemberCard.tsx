import { useState } from "react";
import { useParams } from "react-router-dom";
import { BsThreeDots } from "react-icons/bs";
import {
  FaUserMinus,
  FaChevronDown,
  FaChevronUp,
  FaReceipt,
} from "react-icons/fa";
import {
  HiPencilSquare,
  HiPhone,
  HiMapPin,
  HiEnvelope,
  HiDocumentText,
} from "react-icons/hi2";
import branchHooks from "@/hooks/useBranch";
import { useMemberFinanceEntries } from "@/hooks/useBranchFinance";
import confirm from "@/utils/sweetAlert";
import dropdownHooks from "@/hooks/useDropdown";
import { formatDateShort } from "@/utils/dateUtils";
import { formatCurrency } from "../finance/financeUtils";
import type { BranchMember, FinanceEntry } from "@/types";

interface BranchMemberCardProps {
  member: BranchMember;
  onEdit?: (member: BranchMember) => void;
}

const BranchMemberCard = ({ member, onEdit }: BranchMemberCardProps) => {
  const { branchId } = useParams<{ branchId: string }>();
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const { user, meta } = member;
  const isManual = meta.is_manual ?? !user?.id;
  const memberName = member.name || user?.full_name || "Student";
  const memberId = member.id || meta.member_id;

  // On-demand fetch of finance transactions when expanded
  const {
    data: financeData,
    isLoading: isFinanceLoading,
    isError: isFinanceError,
  } = useMemberFinanceEntries(branchId || "", memberId, isExpanded);

  const transactions: FinanceEntry[] = financeData?.data?.entries || [];

  const totalPaid = transactions.reduce(
    (sum, t) => sum + (t.paid_amount ?? (t.type === "INCOME" ? t.amount : 0)),
    0
  );
  const totalDue = transactions.reduce(
    (sum, t) => sum + (t.due_amount ?? 0),
    0
  );

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
      title: "Remove Student?",
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
    if (meta.is_admin) {
      return (
        <span className="shrink-0 rounded-full border border-indigo-200/90 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 shadow-2xs">
          Admin
        </span>
      );
    }
    if (meta.is_moderator) {
      return (
        <span className="shrink-0 rounded-full border border-purple-200/90 bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 shadow-2xs">
          Moderator
        </span>
      );
    }
    return null;
  };

  return (
    <div
      onClick={() => setIsExpanded((prev) => !prev)}
      className={`group flex flex-col rounded-2xl border p-3 shadow-xs transition-all duration-200 cursor-pointer ${
        isExpanded
          ? "border-blue-300 bg-white ring-2 ring-blue-500/15 shadow-sm"
          : meta.is_self
          ? "border-blue-300 bg-white ring-2 ring-blue-500/10 hover:border-blue-400 hover:shadow-md"
          : "border-gray-300 bg-white hover:border-blue-300 hover:shadow-md"
      }`}
    >
      {/* Main Top Row */}
      <div className="flex items-center justify-between w-full">
        <div className="flex min-w-0 items-center space-x-3.5 sm:space-x-4">
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

            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
              {!isManual && user?.user_name && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200/70 bg-gray-50/80 px-2.5 py-1 text-xs font-medium text-gray-600">
                  @{user.user_name}
                </span>
              )}
              {member.phone && (
                <a
                  href={`tel:${member.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200/70 bg-gray-50/80 px-2.5 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                  <HiPhone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  <span>{member.phone}</span>
                </a>
              )}
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex max-w-65 items-center gap-1.5 truncate rounded-lg border border-gray-200/70 bg-gray-50/80 px-2.5 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-100"
                  title={member.email}
                >
                  <HiEnvelope className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  <span className="truncate">{member.email}</span>
                </a>
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
              {member.note && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsNoteExpanded((prev) => !prev);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg border border-amber-200/80 bg-amber-50/70 px-2.5 py-1 text-left text-xs font-medium text-amber-800 transition-all hover:bg-amber-100/80 cursor-pointer ${
                    isNoteExpanded
                      ? "w-full max-w-full whitespace-pre-line"
                      : "max-w-80 truncate"
                  }`}
                  title={
                    isNoteExpanded
                      ? "ক্লিক করে ছোট করুন"
                      : "ক্লিক করে পুরো নোটটি দেখুন"
                  }
                >
                  <HiDocumentText className="mt-0.5 h-3.5 w-3.5 shrink-0 self-start text-amber-600" />
                  <span
                    className={
                      isNoteExpanded ? "leading-relaxed break-words" : "truncate"
                    }
                  >
                    {member.note}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions & Expand Button */}
        <div
          className="ml-3 flex shrink-0 items-center gap-1.5 sm:gap-2"
          onClick={(e) => e.stopPropagation()}
        >
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

          {/* Expand toggle chevron */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded((prev) => !prev);
            }}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            title={isExpanded ? "খতিয়ান বন্ধ করুন" : "লেনদেনের খতিয়ান দেখুন"}
          >
            {isExpanded ? (
              <FaChevronUp className="h-3.5 w-3.5 text-blue-600" />
            ) : (
              <FaChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Financial History Panel */}
      {isExpanded && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3 border-t border-gray-100 pt-3 animate-in fade-in duration-200"
        >
          {/* Header & Stats Bar */}
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <FaReceipt className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-bold text-gray-800">
                আর্থিক লেনদেনের বিবরণী
              </span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                {transactions.length} টি
              </span>
            </div>

            {transactions.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">
                  মোট আদায়: ৳{formatCurrency(totalPaid)}
                </span>
                {totalDue > 0 && (
                  <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 font-bold text-rose-700">
                    মোট বকেয়া: ৳{formatCurrency(totalDue)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Body */}
          {isFinanceLoading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-gray-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <span>লেনদেনের তথ্য লোড হচ্ছে...</span>
            </div>
          ) : isFinanceError ? (
            <div className="rounded-xl border border-red-100 bg-red-50/70 py-3 text-center text-xs text-red-600">
              লেনদেনের তথ্য লোড করতে সমস্যা হয়েছে।
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-gray-100 bg-gray-50/50 py-6 text-center text-gray-400">
              <FaReceipt className="h-6 w-6 text-gray-300" />
              <p className="text-xs font-medium text-gray-500">
                এই শিক্ষার্থীর নামে কোনো লেনদেনের রেকর্ড নেই
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200/70 bg-gray-50/60 px-3 py-2 text-xs transition-colors hover:bg-gray-100/70"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-gray-900">
                        {t.category?.name || "ক্যাটাগরি"}
                      </span>
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                          t.type === "INCOME"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {t.type === "INCOME" ? "জমা" : "খরচ"}
                      </span>
                      {t.payment_status === "PAID" && (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700">
                          পরিশোধিত
                        </span>
                      )}
                      {t.payment_status === "PARTIAL" && (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">
                          আংশিক বাকি
                        </span>
                      )}
                      {t.payment_status === "DUE" && (
                        <span className="rounded-full border border-rose-200 bg-rose-50 px-1.5 py-0.2 text-[9px] font-bold text-rose-800">
                          সম্পূর্ণ বাকি
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                      <span>{formatDateShort(t.date)}</span>
                      {t.note && (
                        <span className="max-w-72 truncate text-gray-600">
                          • {t.note}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-black ${
                        t.type === "INCOME" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {t.type === "INCOME" ? "+" : "-"}৳
                      {formatCurrency(t.total_amount ?? t.amount)}
                    </span>
                    {(t.due_amount ?? 0) > 0 && (
                      <p className="text-[10px] font-bold text-rose-600">
                        বকেয়া: ৳{formatCurrency(t.due_amount ?? 0)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BranchMemberCard;
