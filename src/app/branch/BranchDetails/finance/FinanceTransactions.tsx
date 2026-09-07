import { Fragment, useState } from "react";
import { useParams } from "react-router-dom";
import {
  useFinanceEntries,
  useDeleteFinanceEntry,
  useCategoriesList,
} from "@/hooks/useBranchFinance";
import branchHooks from "@/hooks/useBranch";
import FinanceAddEntryForm from "./FinanceAddEntryForm";
import CollectDueModal from "./CollectDueModal";
import { confirmDelete } from "@/utils/sweetAlert";
import { formatCurrency, getMonthName } from "./financeUtils";
import {
  TransactionsTableSkeleton,
  FetchingIndicator,
} from "@/app/shared/LoadingSkeleton/FinanceSkeletons";
import type { FinanceEntry, FinanceDetailItem } from "@/types";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaChevronDown,
  FaChevronUp,
  FaMoneyBillWave,
} from "react-icons/fa";

const FinanceTransactions = () => {
  const { branchId } = useParams<{ branchId: string }>();

  // Check if current user is branch admin
  const { data: branchDetailsData } = branchHooks.useBranchDetails();
  const meta = branchDetailsData?.data?.meta;
  const canManageFinance = meta?.is_admin;

  // State for adding/editing entry modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinanceEntry | null>(null);

  // State for collecting/paying due modal
  const [isDueModalOpen, setIsDueModalOpen] = useState(false);
  const [selectedDueEntry, setSelectedDueEntry] = useState<FinanceEntry | null>(
    null
  );

  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [type, setType] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("");
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
    const label = `${entry.type === "INCOME" ? "Income" : "Expense"}: ${formatCurrency(
      entry.amount
    )} (${entry.category?.name})`;
    const confirmed = await confirmDelete(label);
    if (confirmed) {
      deleteEntry(entry.id);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, "0");
    const month = getMonthName(d.getMonth() + 1);
    const year = d.getFullYear();
    return `${day} ${month}, ${year}`;
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
      <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-xs sm:p-4">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {/* Type Filter */}
          <div>
            <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Transactions</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.type === "INCOME" ? "Income" : "Expense"})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
              Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                setPage(1);
              }}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="PAID">পরিশোধিত (Paid)</option>
              <option value="HAS_DUE">সকল বকেয়া (Has Due)</option>
              <option value="PARTIAL">আংশিক বাকি (Partial)</option>
              <option value="DUE">সম্পূর্ণ বাকি (Full Due)</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onClick={(e) => {
                try {
                  e.currentTarget.showPicker?.();
                } catch {
                  // Ignore browsers that do not support showPicker or dismiss errors
                }
              }}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none [&::-webkit-calendar-picker-indicator]:hidden"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onClick={(e) => {
                try {
                  e.currentTarget.showPicker?.();
                } catch {
                  // Ignore browsers that do not support showPicker or dismiss errors
                }
              }}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none [&::-webkit-calendar-picker-indicator]:hidden"
            />
          </div>

          {/* Clear Filters */}
          <div className="col-span-2 flex items-end sm:col-span-1">
            <button
              onClick={() => {
                setType("");
                setCategoryId("");
                setPaymentStatus("");
                setStartDate("");
                setEndDate("");
                setPage(1);
              }}
              className="w-full cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

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
                    Person Name
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
                  const hasDue =
                    (entry.due_amount !== undefined && entry.due_amount > 0) ||
                    entry.payment_status === "PARTIAL" ||
                    entry.payment_status === "DUE";
                  const canExpand = hasDetails || hasNotes || hasDue;

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
                        <td className="border-b border-gray-200/80 px-3 py-3.5 font-medium whitespace-nowrap text-gray-600 sm:px-5">
                          {formatDate(entry.date)}
                        </td>

                        {/* Category & Status */}
                        <td className="border-b border-gray-200/80 px-3 py-3.5 whitespace-nowrap sm:px-5">
                          <span className="block font-semibold text-gray-900">
                            {entry.category?.name}
                          </span>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold sm:text-[10px] ${
                                entry.type === "INCOME"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {entry.type === "INCOME" ? "Income" : "Expense"}
                            </span>
                            {entry.payment_status === "PARTIAL" ? (
                              <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-800 sm:text-[10px]">
                                আংশিক বাকি:{" "}
                                {formatCurrency(entry.due_amount || 0)}
                              </span>
                            ) : entry.payment_status === "DUE" ? (
                              <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-800 sm:text-[10px]">
                                সম্পূর্ণ বাকি
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 sm:text-[10px]">
                                পরিশোধিত
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Person Name / Details */}
                        <td className="border-b border-gray-200/80 px-3 py-3.5 font-medium whitespace-nowrap text-gray-600 sm:px-5">
                          {entry.person_name ? (
                            <div>
                              <p className="font-semibold text-gray-900">
                                {entry.person_name}
                              </p>
                              {entry.person_phone && (
                                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-gray-600">
                                  {entry.person_phone}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
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
                                  ? "আদায়: "
                                  : "প্রদত্ত: "}
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

                            {/* Slot 3 & 4: Edit & Delete buttons */}
                            {canManageFinance ? (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingEntry(entry);
                                    setIsModalOpen(true);
                                  }}
                                  className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                  title="Edit Transaction"
                                >
                                  <FaEdit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(entry);
                                  }}
                                  className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                  title="Delete Transaction"
                                >
                                  <FaTrash className="h-3.5 w-3.5" />
                                </button>
                              </>
                            ) : null}

                            {!canManageFinance && !canExpand && (
                              <span className="text-gray-300">-</span>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row Detail view */}
                      {isExpanded && canExpand && (
                        <tr className="border-b border-gray-200/80 bg-gray-50/40">
                          <td
                            colSpan={5}
                            className="border-b border-gray-200/80 px-4 py-3 sm:px-8"
                          >
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
                                        {formatCurrency(
                                          entry.total_amount ?? entry.amount
                                        )}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-[10px] font-bold text-green-700 uppercase">
                                        {entry.type === "INCOME"
                                          ? "নগদ আদায়"
                                          : "নগদ পরিশোধ"}
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
                                  {canManageFinance && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedDueEntry(entry);
                                        setIsDueModalOpen(true);
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
                                  )}
                                </div>
                              )}

                              {/* Notes */}
                              {hasNotes && (
                                <div className="flex items-start gap-2 rounded-lg border border-gray-200/80 bg-white p-2.5 shadow-xs">
                                  <p className="rounded-lg bg-blue-500 px-2 py-1 font-bold text-white">
                                    Note
                                  </p>
                                  <p className="font-medium text-gray-700">
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
                                    {entry.details.map(
                                      (
                                        item: FinanceDetailItem,
                                        idx: number
                                      ) => (
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
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
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
        onClose={() => {
          setIsModalOpen(false);
          setEditingEntry(null);
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
