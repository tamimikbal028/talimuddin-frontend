import { Fragment, useState } from "react";
import { useParams } from "react-router-dom";
import {
  useFinanceEntries,
  useDeleteFinanceEntry,
  useCategoriesList,
} from "@/hooks/useBranchFinance";
import branchHooks from "@/hooks/useBranch";
import authHooks from "@/hooks/useAuth";
import { toast } from "sonner";
import FinanceAddEntryForm from "./components/FinanceAddEntryForm";
import CollectDueModal from "./components/CollectDueModal";
import TransactionFilters from "./components/TransactionFilters";
import TransactionExpandedRow from "./components/TransactionExpandedRow";
import { confirmDelete, promptFinanceActionCode } from "@/utils/sweetAlert";
import { formatCurrency, getMonthName } from "../financeUtils";
import {
  TransactionsTableSkeleton,
  FetchingIndicator,
} from "@/app/shared/LoadingSkeleton/FinanceSkeletons";
import type { FinanceEntry } from "@/types";
import {
  FaPlus,
  FaChevronDown,
  FaChevronUp,
  FaMoneyBillWave,
} from "react-icons/fa";

const FinanceTransactions = () => {
  const { branchId } = useParams<{ branchId: string }>();

  // Current logged in user
  const { user } = authHooks.useUser();

  // Only Branch Admin or Branch Moderator can add entries / manage finance
  const { data: branchDetailsData } = branchHooks.useBranchDetails();
  const meta = branchDetailsData?.data?.meta;
  const canManageFinance = !!meta?.is_admin || !!meta?.is_moderator;
  const isAdmin = !!meta?.is_admin;
  const isModerator = !!meta?.is_moderator && !isAdmin;

  // State for adding/editing entry modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinanceEntry | null>(null);
  const [editingActionCode, setEditingActionCode] = useState<
    string | undefined
  >(undefined);

  // State for collecting/paying due modal
  const [isDueModalOpen, setIsDueModalOpen] = useState(false);
  const [selectedDueEntry, setSelectedDueEntry] = useState<FinanceEntry | null>(
    null
  );

  // Filter States
  const [type, setType] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Expended row details state (maps entryId -> boolean)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Query categories for filter dropdown
  const { data: categoriesData } = useCategoriesList(branchId as string);
  const categories = categoriesData?.data?.categories ?? [];

  // Query transactions
  const limit = 15;
  const filters = {
    type: type || undefined,
    category_id: categoryId || undefined,
    payment_status: paymentStatus || undefined,
    page,
    limit,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };
  const { data, isLoading, isFetching } = useFinanceEntries(
    branchId as string,
    filters
  );
  const { mutate: deleteEntry } = useDeleteFinanceEntry(branchId as string);

  const entries = data?.data?.entries ?? [];
  const pagination = data?.data?.pagination;

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (entry: FinanceEntry) => {
    const isOwner = !!user?.id && user.id === entry.recorded_by?.id;
    const hasDue =
      (entry.due_amount !== undefined && entry.due_amount > 0) ||
      entry.payment_status === "PARTIAL" ||
      entry.payment_status === "DUE";

    // If entry has due, only and only creator can delete it
    if (hasDue && !isOwner) {
      toast.error(
        `বকেয়া থাকায় শুধুমাত্র যিনি এন্ট্রি করেছেন (${entry.recorded_by?.full_name || "এন্ট্রিকারী"}) তিনিই এটি ডিলিট করতে পারবেন`
      );
      return;
    }

    let actionCode: string | undefined = undefined;

    if (isModerator) {
      const code = await promptFinanceActionCode("delete");
      if (!code) return;
      actionCode = code;
    } else {
      const label = `${entry.type === "INCOME" ? "Income" : "Expense"}: ${formatCurrency(
        entry.amount
      )} (${entry.category?.name})`;
      const confirmed = await confirmDelete(label);
      if (!confirmed) return;
    }

    deleteEntry({ entryId: entry.id, actionCode });
  };

  const handleEdit = async (entry: FinanceEntry) => {
    const isOwner = !!user?.id && user.id === entry.recorded_by?.id;
    const hasDue =
      (entry.due_amount !== undefined && entry.due_amount > 0) ||
      entry.payment_status === "PARTIAL" ||
      entry.payment_status === "DUE";

    // If entry has due, only and only creator can edit it
    if (hasDue && !isOwner) {
      toast.error(
        `বকেয়া থাকায় শুধুমাত্র যিনি এন্ট্রি করেছেন (${entry.recorded_by?.full_name || "এন্ট্রিকারী"}) তিনিই এটি এডিট করতে পারবেন`
      );
      return;
    }

    if (isModerator) {
      const code = await promptFinanceActionCode("edit");
      if (!code) return;
      setEditingActionCode(code);
      setEditingEntry(entry);
      setIsModalOpen(true);
    } else {
      setEditingActionCode(undefined);
      setEditingEntry(entry);
      setIsModalOpen(true);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, "0");
    const month = getMonthName(d.getMonth() + 1);
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, "0");
    const month = getMonthName(d.getMonth() + 1);
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = hours.toString().padStart(2, "0");
    return `${day} ${month} ${year} • ${strHours}:${minutes} ${ampm}`;
  };

  const handleClearFilters = () => {
    setType("");
    setCategoryId("");
    setPaymentStatus("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Action Header */}
      <div className="flex flex-row items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2.5">
          <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase sm:text-sm">
            All Transactions
          </h3>
          <FetchingIndicator isFetching={isFetching} isLoading={isLoading} />
        </div>
        {canManageFinance && (
          <button
            onClick={() => {
              setEditingActionCode(undefined);
              setEditingEntry(null);
              setIsModalOpen(true);
            }}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 active:scale-98 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <FaPlus className="h-3.5 w-3.5" />
            <span>Add Entry</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <TransactionFilters
        type={type}
        setType={(val) => {
          setType(val);
          setPage(1);
        }}
        categoryId={categoryId}
        setCategoryId={(val) => {
          setCategoryId(val);
          setPage(1);
        }}
        paymentStatus={paymentStatus}
        setPaymentStatus={(val) => {
          setPaymentStatus(val);
          setPage(1);
        }}
        startDate={startDate}
        setStartDate={(val) => {
          setStartDate(val);
          setPage(1);
        }}
        endDate={endDate}
        setEndDate={(val) => {
          setEndDate(val);
          setPage(1);
        }}
        categories={categories}
        onClearFilters={handleClearFilters}
      />

      {/* Transaction List table */}
      {isLoading ? (
        <TransactionsTableSkeleton />
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white py-14 text-center">
          <p className="text-sm text-gray-500">
            No transactions match your current filters.
          </p>
        </div>
      ) : (
        <div
          className={`overflow-hidden rounded-xl border border-gray-300 bg-white shadow-xs transition-opacity duration-200 ${
            isFetching ? "opacity-70" : "opacity-100"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead className="border-b border-gray-300 bg-gray-50/80 text-[11px] font-bold tracking-wider text-gray-500 uppercase sm:text-xs">
                <tr>
                  <th className="px-3 py-3 whitespace-nowrap sm:px-5">Date</th>
                  <th className="px-3 py-3 whitespace-nowrap sm:px-5">
                    Category
                  </th>
                  <th className="px-3 py-3 whitespace-nowrap sm:px-5">
                    Recorded By
                  </th>
                  <th className="px-3 py-3 text-right whitespace-nowrap sm:px-5">
                    Amount
                  </th>
                  <th className="px-3 py-3 text-center whitespace-nowrap sm:px-5">
                    {canManageFinance ? "Actions" : ""}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-500">
                {entries.map((entry) => {
                  const isExpanded = expandedRows[entry.id];
                  const hasDetails = entry.details && entry.details.length > 0;
                  const hasNotes = !!entry.note;
                  const isOwner =
                    !!user?.id && user.id === entry.recorded_by?.id;
                  const hasDue =
                    (entry.due_amount !== undefined && entry.due_amount > 0) ||
                    entry.payment_status === "PARTIAL" ||
                    entry.payment_status === "DUE";
                  const canExpand =
                    hasDetails || hasNotes || hasDue || canManageFinance;

                  return (
                    <Fragment key={entry.id}>
                      <tr
                        onClick={() => {
                          if (canExpand) {
                            toggleRow(entry.id);
                          }
                        }}
                        className={`border-b border-gray-200/80 transition-colors ${
                          canExpand
                            ? "cursor-pointer select-none hover:bg-gray-50/90"
                            : "hover:bg-gray-50/50"
                        } ${isExpanded && canExpand ? "bg-blue-50/30" : ""}`}
                      >
                        {/* Date */}
                        <td className="border-b border-gray-200/80 px-3 py-3.5 whitespace-nowrap sm:px-5">
                          <span className="block font-medium text-gray-700">
                            {formatDate(entry.date)}
                          </span>
                          <div className="mt-1">
                            <span
                              className={`inline-block shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold sm:text-[10px] ${
                                entry.type === "INCOME"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {entry.type === "INCOME" ? "Income" : "Expense"}
                            </span>
                          </div>
                        </td>

                        {/* Category & Status */}
                        <td className="border-b border-gray-200/80 px-3 py-3.5 whitespace-nowrap sm:px-5">
                          <span className="block font-semibold text-gray-900">
                            {entry.category?.name}
                          </span>
                          <div className="mt-1 flex items-center gap-1.5 whitespace-nowrap">
                            {entry.payment_status === "PARTIAL" ? (
                              <span className="inline-flex shrink-0 items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-800 sm:text-[10px]">
                                আংশিক বাকি:{" "}
                                {formatCurrency(entry.due_amount || 0)}
                              </span>
                            ) : entry.payment_status === "DUE" ? (
                              <span className="inline-flex shrink-0 items-center rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-800 sm:text-[10px]">
                                সম্পূর্ণ বাকি
                              </span>
                            ) : (
                              <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 sm:text-[10px]">
                                পরিশোধিত
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Recorded By & Created At */}
                        <td className="border-b border-gray-200/80 px-3 py-3.5 font-medium whitespace-nowrap text-gray-600 sm:px-5">
                          <p className="truncate font-semibold text-gray-900">
                            {entry.recorded_by?.full_name ||
                              entry.recorded_by?.user_name ||
                              "Unknown"}
                          </p>
                          <p className="mt-0.5 text-[10px] text-gray-500">
                            {formatDateTime(entry.created_at)}
                          </p>
                        </td>

                        {/* Amount */}
                        <td
                          className={`border-b border-gray-200/80 px-3 py-3.5 text-right font-bold whitespace-nowrap sm:px-5 ${
                            entry.type === "INCOME"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          <div>
                            <span>
                              {entry.type === "INCOME" ? "+" : "-"}
                              {formatCurrency(
                                entry.total_amount ?? entry.amount
                              )}
                            </span>
                            {entry.payment_status === "PARTIAL" && (
                              <p className="mt-0.5 text-[10px] font-semibold text-amber-700">
                                {entry.type === "INCOME"
                                  ? "পেয়েছি: "
                                  : "দিয়েছি: "}
                                {formatCurrency(entry.paid_amount ?? 0)}
                              </p>
                            )}
                            {entry.payment_status === "DUE" && (
                              <p className="mt-0.5 text-[10px] font-semibold text-rose-600">
                                {entry.type === "INCOME"
                                  ? "আমি পাবো"
                                  : "আমাকে দিতে হবে"}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="border-b border-gray-200/80 px-3 py-3.5 text-center whitespace-nowrap sm:px-5">
                          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                            {/* Slot 1: Due Action button or fixed width spacer */}
                            {canManageFinance &&
                              (hasDue ? (
                                isOwner ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedDueEntry(entry);
                                      setIsDueModalOpen(true);
                                    }}
                                    className="flex h-7 w-18 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-1.5 py-1 text-[11px] font-bold text-amber-800 transition-colors hover:bg-amber-100"
                                    title={
                                      entry.type === "INCOME"
                                        ? "বকেয়া আদায় করুন"
                                        : "দেনা পরিশোধ করুন"
                                    }
                                  >
                                    <FaMoneyBillWave className="h-3 w-3 shrink-0 text-amber-600" />
                                    <span>
                                      {entry.type === "INCOME"
                                        ? "আদায়"
                                        : "পরিশোধ"}
                                    </span>
                                  </button>
                                ) : (
                                  <span
                                    title={`শুধুমাত্র যিনি এন্ট্রি করেছেন (${entry.recorded_by?.full_name || "এন্ট্রিকারী"}) তিনিই আদায়/পরিশোধ করতে পারবেন`}
                                    className="flex h-7 w-18 shrink-0 cursor-not-allowed items-center justify-center rounded-lg border border-gray-200 bg-gray-100 px-1.5 py-1 text-[10px] font-medium text-gray-400 select-none"
                                  >
                                    {entry.type === "INCOME"
                                      ? "আদায়"
                                      : "পরিশোধ"}
                                  </span>
                                )
                              ) : (
                                <div className="h-7 w-18 shrink-0" />
                              ))}

                            {/* Slot 2: Expand Chevron button or fixed width spacer */}
                            {canExpand ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRow(entry.id);
                                }}
                                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                title="View Details"
                              >
                                {isExpanded ? (
                                  <FaChevronUp className="h-3.5 w-3.5 text-blue-600" />
                                ) : (
                                  <FaChevronDown className="h-3.5 w-3.5" />
                                )}
                              </button>
                            ) : (
                              <div className="h-7 w-7 shrink-0" />
                            )}

                            {!canManageFinance && !canExpand && (
                              <span className="text-gray-300">-</span>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row Detail view */}
                      {isExpanded && canExpand && (
                        <TransactionExpandedRow
                          entry={entry}
                          canManageFinance={!!canManageFinance}
                          isAdmin={isAdmin}
                          isModerator={isModerator}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3.5 sm:px-5">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="flex items-center text-xs font-medium text-gray-600">
                  Page {page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page === pagination.totalPages}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Showing page{" "}
                    <span className="font-bold text-gray-800">{page}</span> of{" "}
                    <span className="font-bold text-gray-800">
                      {pagination.totalPages}
                    </span>{" "}
                    (Total{" "}
                    <span className="font-bold text-gray-800">
                      {pagination.totalDocs}
                    </span>{" "}
                    entries)
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-xs">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center rounded-l-md border border-gray-300 px-2 py-2 text-gray-400 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    {/* Render page numbers */}
                    {[...Array(pagination.totalPages)].map((_, idx) => {
                      const pNum = idx + 1;
                      return (
                        <button
                          key={pNum}
                          onClick={() => setPage(pNum)}
                          className={`relative inline-flex items-center px-3 py-1.5 text-xs font-semibold focus:z-20 ${
                            page === pNum
                              ? "z-10 border border-blue-600 bg-blue-600 text-white"
                              : "border border-gray-300 text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          {pNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(pagination.totalPages, p + 1))
                      }
                      disabled={page === pagination.totalPages}
                      className="relative inline-flex items-center rounded-r-md border border-gray-300 px-2 py-2 text-gray-400 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add or Edit Entry Modal */}
      <FinanceAddEntryForm
        isOpen={isModalOpen}
        branchId={branchId as string}
        entryToEdit={editingEntry}
        actionCode={editingActionCode}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEntry(null);
          setEditingActionCode(undefined);
        }}
      />

      {/* Collect or Pay Due Modal */}
      <CollectDueModal
        isOpen={isDueModalOpen}
        branchId={branchId as string}
        entry={selectedDueEntry}
        onClose={() => {
          setIsDueModalOpen(false);
          setSelectedDueEntry(null);
        }}
      />
    </div>
  );
};

export default FinanceTransactions;
