import {
  FaMoneyBillWave,
  FaEdit,
  FaTrash,
  FaPhoneAlt,
  FaLock,
} from "react-icons/fa";
import { formatCurrency } from "../../financeUtils";
import type { FinanceEntry, FinanceDetailItem } from "@/types";
import authHooks from "@/hooks/useAuth";

interface TransactionExpandedRowProps {
  entry: FinanceEntry;
  canManageFinance: boolean;
  isAdmin?: boolean;
  isModerator?: boolean;
  onOpenDueModal: (entry: FinanceEntry) => void;
  onEdit: (entry: FinanceEntry) => void;
  onDelete: (entry: FinanceEntry) => void;
}

const TransactionExpandedRow = ({
  entry,
  canManageFinance,
  isAdmin,
  isModerator,
  onOpenDueModal,
  onEdit,
  onDelete,
}: TransactionExpandedRowProps) => {
  const { user } = authHooks.useUser();
  const isOwner = !!user?.id && user.id === entry.recorded_by?.id;

  const hasDue =
    (entry.due_amount !== undefined && entry.due_amount > 0) ||
    entry.payment_status === "PARTIAL" ||
    entry.payment_status === "DUE";
  const hasNotes = !!entry.note;
  const hasDetails = entry.details && entry.details.length > 0;
  const hasPerson = !!entry.person_name || !!entry.person_phone;

  return (
    <tr className="border-b border-gray-200/80 bg-gray-50/40">
      <td colSpan={5} className="border-b border-gray-200/80 px-4 py-3 sm:px-8">
        <div className="space-y-3 text-xs">
          {/* Due status details card if has due */}
          {hasDue && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-linear-to-r from-amber-50 to-orange-50/50 p-3 shadow-2xs">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                    মোট মূল্য
                  </span>
                  <p className="font-bold text-gray-900">
                    {formatCurrency(entry.total_amount ?? entry.amount)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-green-700 uppercase">
                    {entry.type === "INCOME" ? "নগদ আদায়" : "নগদ পরিশোধ"}
                  </span>
                  <p className="font-bold text-green-800">
                    {formatCurrency(entry.paid_amount ?? 0)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-800 uppercase">
                    {entry.type === "INCOME"
                      ? "অবশিষ্ট আমি পাবো"
                      : "অবশিষ্ট আমাকে দিতে হবে"}
                  </span>
                  <p className="text-sm font-black text-amber-950">
                    {formatCurrency(entry.due_amount ?? 0)}
                  </p>
                </div>
              </div>
              {canManageFinance &&
                (isOwner ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDueModal(entry);
                    }}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700"
                  >
                    <FaMoneyBillWave className="h-3.5 w-3.5" />
                    <span>
                      {entry.type === "INCOME"
                        ? "বকেয়া আদায় (আমি পাবো)"
                        : "দেনা পরিশোধ (আমাকে দিতে হবে)"}
                    </span>
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200/90 bg-amber-50/90 px-3 py-1.5 text-[11px] font-medium text-amber-900 shadow-2xs">
                    <span>
                      শুধুমাত্র যিনি এন্ট্রি করেছেন{" "}
                      {entry.recorded_by?.full_name
                        ? `(${entry.recorded_by.full_name})`
                        : ""}{" "}
                      তিনিই আদায়/পরিশোধ করতে পারবেন
                    </span>
                  </div>
                ))}
            </div>
          )}

          {/* Person Name & Number in side-by-side box */}
          {hasPerson && (
            <div className="flex w-fit flex-wrap items-center gap-2.5 rounded-xl border border-gray-200/90 bg-white px-3.5 py-2 shadow-2xs">
              {entry.person_name && (
                <span className="font-bold text-gray-900 sm:text-sm">
                  {entry.person_name}
                </span>
              )}

              {entry.person_name && entry.person_phone && (
                <span className="text-gray-300">|</span>
              )}

              {entry.person_phone && (
                <a
                  href={`tel:${entry.person_phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 active:scale-95"
                  title={`Call ${entry.person_name || entry.person_phone}`}
                >
                  <FaPhoneAlt className="h-2.5 w-2.5 text-emerald-600" />
                  <span>{entry.person_phone}</span>
                </a>
              )}
            </div>
          )}

          {/* Notes */}
          {hasNotes && (
            <div className="flex items-start gap-2 rounded-lg border border-gray-200/80 bg-white p-2.5 shadow-xs">
              <p className="font-medium whitespace-pre-line text-gray-700">
                {entry.note}
              </p>
            </div>
          )}

          {/* Breakdown details */}
          {hasDetails && (
            <div className="space-y-1.5">
              <p className="text-[9px] font-bold tracking-wider text-gray-500 uppercase">
                Breakdown List:
              </p>
              <div className="divide-y divide-gray-200/70 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xs">
                {entry.details.map((item: FinanceDetailItem, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2"
                  >
                    <span className="font-semibold text-gray-700">
                      {item.itemName}
                    </span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Management Actions: Edit & Delete */}
          {canManageFinance && (
            <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-gray-200/80 pt-2.5">
              {hasDue && !isOwner ? (
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800">
                  <span>
                    বকেয়া থাকায় শুধুমাত্র যিনি এন্ট্রি করেছেন{" "}
                    {entry.recorded_by?.full_name
                      ? `(${entry.recorded_by.full_name})`
                      : ""}{" "}
                    তিনিই এটি এডিট বা ডিলিট করতে পারবেন
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(entry);
                    }}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
                    title={
                      isModerator && !isAdmin
                        ? "এডিট করতে এডমিন সিকিউরিটি কোড প্রয়োজন"
                        : "Edit Transaction"
                    }
                  >
                    <FaEdit className="h-3.5 w-3.5 text-blue-500" />
                    <span>Edit</span>
                    {isModerator && !isAdmin && (
                      <FaLock
                        className="h-2.5 w-2.5 text-amber-500"
                        title="কোড প্রয়োজন"
                      />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(entry);
                    }}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 shadow-2xs transition-colors hover:border-red-300 hover:bg-red-50 active:scale-95"
                    title={
                      isModerator && !isAdmin
                        ? "ডিলিট করতে এডমিন সিকিউরিটি কোড প্রয়োজন"
                        : "Delete Transaction"
                    }
                  >
                    <FaTrash className="h-3.5 w-3.5 text-red-500" />
                    <span>Delete</span>
                    {isModerator && !isAdmin && (
                      <FaLock
                        className="h-2.5 w-2.5 text-amber-500"
                        title="কোড প্রয়োজন"
                      />
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default TransactionExpandedRow;
