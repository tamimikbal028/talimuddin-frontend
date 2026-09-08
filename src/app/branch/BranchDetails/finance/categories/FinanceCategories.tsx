import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useFinanceCategories } from "@/hooks/useBranchFinance";
import { formatCurrency, getMonthName } from "../financeUtils";
import {
  CategoriesTableSkeleton,
  FetchingIndicator,
} from "@/app/shared/LoadingSkeleton/FinanceSkeletons";
import {
  FaTag,
  FaChevronDown,
  FaCalendarAlt,
  FaSearch,
  FaExpandAlt,
  FaCompressAlt,
  FaTimes,
} from "react-icons/fa";

const FinanceCategories = () => {
  const { branchId } = useParams<{ branchId: string }>();

  // Filter state (All, Income, Expense)
  const [filterType, setFilterType] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const { data, isLoading, isFetching } = useFinanceCategories(
    branchId as string,
    filterType === "INCOME" || filterType === "EXPENSE" ? filterType : undefined
  );

  const categories = useMemo(
    () => data?.data?.categories ?? [],
    [data?.data?.categories]
  );

  // Initialize expanded set once categories are loaded
  useEffect(() => {
    if (!isInitialized && categories.length > 0) {
      // Expand all categories by default for immediate month-wise visibility
      setExpandedIds(new Set(categories.map((c) => c.id)));
      setIsInitialized(true);
    }
  }, [categories, isInitialized]);

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.trim().toLowerCase();
    return categories.filter((c) => c.category.toLowerCase().includes(query));
  }, [categories, searchQuery]);

  // Overall calculations for summary strip
  const summaryStats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalCount = 0;
    let totalDue = 0;

    for (const cat of categories) {
      totalIncome += cat.income;
      totalExpense += cat.expense;
      totalCount += cat.count;
      totalDue += cat.due || 0;
    }

    return {
      totalCategories: categories.length,
      totalIncome,
      totalExpense,
      totalCount,
      totalDue,
    };
  }, [categories]);

  // Toggle individual category
  const toggleCategory = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Expand / Collapse all
  const allExpanded =
    filteredCategories.length > 0 &&
    filteredCategories.every((c) => expandedIds.has(c.id));

  const toggleExpandAll = () => {
    if (allExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(filteredCategories.map((c) => c.id)));
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-gray-900 sm:text-lg">
              ক্যাটাগরি ও মাসভিত্তিক বিবরণী
            </h2>
            <FetchingIndicator isFetching={isFetching} isLoading={isLoading} />
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            প্রতিটি ক্যাটাগরির ভেতরে মাসভিত্তিক আয়, ব্যয় ও বকেয়ার হিসাব
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Expand All / Collapse All Button */}
          {categories.length > 0 && (
            <button
              onClick={toggleExpandAll}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs transition-colors hover:bg-gray-50"
              title={allExpanded ? "সবগুলো বন্ধ করুন" : "সবগুলো খুলুন"}
            >
              {allExpanded ? (
                <>
                  <FaCompressAlt className="h-3 w-3 text-gray-500" />
                  <span>সবগুলো বন্ধ করুন</span>
                </>
              ) : (
                <>
                  <FaExpandAlt className="h-3 w-3 text-blue-600" />
                  <span>সবগুলো খুলুন</span>
                </>
              )}
            </button>
          )}

          {/* Filter Type Pills */}
          <div className="flex rounded-lg border border-gray-200 bg-white p-1 shadow-2xs">
            {(
              [
                { id: "", label: "সবগুলো" },
                { id: "INCOME", label: "শুধু আয়" },
                { id: "EXPENSE", label: "শুধু ব্যয়" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setFilterType(t.id)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                  filterType === t.id
                    ? "bg-blue-50 font-bold text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Metrics Strip */}
      {!isLoading && categories.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-xl border border-gray-100 bg-white p-3.5 shadow-2xs">
            <span className="text-[11px] font-semibold text-gray-500">
              মোট ক্যাটাগরি
            </span>
            <p className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">
              {summaryStats.totalCategories} টি
            </p>
            <span className="text-[10px] text-gray-400">
              {summaryStats.totalCount} টি মোট লেনদেন
            </span>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-3.5 shadow-2xs">
            <span className="text-[11px] font-semibold text-emerald-600">
              মোট আয় (ক্যাটাগরি)
            </span>
            <p className="mt-1 text-lg font-bold text-emerald-700 sm:text-xl">
              ৳{formatCurrency(summaryStats.totalIncome)}
            </p>
            <span className="text-[10px] text-gray-400">
              আয় খাতের মোট পরিমাণ
            </span>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-3.5 shadow-2xs">
            <span className="text-[11px] font-semibold text-rose-600">
              মোট ব্যয় (ক্যাটাগরি)
            </span>
            <p className="mt-1 text-lg font-bold text-rose-700 sm:text-xl">
              ৳{formatCurrency(summaryStats.totalExpense)}
            </p>
            <span className="text-[10px] text-gray-400">
              ব্যয় খাতের মোট পরিমাণ
            </span>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-3.5 shadow-2xs">
            <span className="text-[11px] font-semibold text-amber-700">
              মোট বকেয়া
            </span>
            <p className="mt-1 text-lg font-bold text-amber-800 sm:text-xl">
              ৳{formatCurrency(summaryStats.totalDue)}
            </p>
            <span className="text-[10px] text-gray-400">
              অপরিশোধিত পাওনা/দেনা
            </span>
          </div>
        </div>
      )}

      {/* Search Input */}
      {!isLoading && categories.length > 0 && (
        <div className="relative max-w-md">
          <FaSearch className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ক্যাটাগরির নাম দিয়ে খুঁজুন..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pr-8 pl-9 text-xs text-gray-900 shadow-2xs placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <CategoriesTableSkeleton />
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white py-14 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400">
            <FaTag className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-gray-700">
            কোনো লেনদেন যুক্ত ক্যাটাগরি পাওয়া যায়নি
          </p>
          <p className="mt-1 text-xs text-gray-400">
            লেনদেন যুক্ত করার পর ক্যাটাগরি ও মাসভিত্তিক হিসাব এখানে দেখতে পাবেন।
          </p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white py-10 text-center">
          <p className="text-xs text-gray-500">
            "{searchQuery}" দিয়ে কোনো ক্যাটাগরি খুঁজে পাওয়া যায়নি।
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
          >
            অনুসন্ধান রিসেট করুন
          </button>
        </div>
      ) : (
        <div
          className={`space-y-3.5 transition-opacity duration-200 ${
            isFetching ? "opacity-75" : "opacity-100"
          }`}
        >
          {filteredCategories.map((cat) => {
            const isExpanded = expandedIds.has(cat.id);
            const isIncome = cat.type === "INCOME";
            const totalAmount = isIncome ? cat.income : cat.expense;
            const monthsList = cat.months || [];

            return (
              <div
                key={cat.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs transition-shadow hover:shadow-sm"
              >
                {/* Category Header Card */}
                <div
                  onClick={() => toggleCategory(cat.id)}
                  className="flex cursor-pointer flex-col gap-3 p-4 transition-colors select-none hover:bg-gray-50/60 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  {/* Category Info */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isIncome
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      <FaTag className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900 sm:text-base">
                          {cat.category}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isIncome
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border border-rose-200 bg-rose-50 text-rose-700"
                          }`}
                        >
                          {isIncome ? "আয়" : "ব্যয়"}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        <span>{cat.count} টি লেনদেন</span>
                        <span>•</span>
                        <span className="font-medium text-blue-600">
                          {monthsList.length} টি মাস সক্রিয়
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Figures & Chevron */}
                  <div className="flex items-center justify-between gap-3.5 border-t border-gray-100 pt-2.5 sm:justify-end sm:border-t-0 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <div
                        className={`text-base font-extrabold sm:text-lg ${
                          isIncome ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isIncome ? "+" : "-"}৳{formatCurrency(totalAmount)}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] sm:justify-end">
                        <span className="text-gray-600">
                          পরিশোধ: ৳{formatCurrency(cat.paid ?? 0)}
                        </span>
                        {(cat.due ?? 0) > 0 && (
                          <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 font-bold text-amber-700">
                            বকেয়া: ৳{formatCurrency(cat.due ?? 0)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-transform duration-200 ${
                        isExpanded ? "rotate-180 bg-blue-50 text-blue-600" : ""
                      }`}
                    >
                      <FaChevronDown className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>

                {/* Expanded Month-wise Breakdown Content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-slate-50/50 p-3.5 sm:p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-700 uppercase">
                        <FaCalendarAlt className="h-3.5 w-3.5 text-blue-600" />
                        <span>
                          মাসভিত্তিক লেনদেন বিভাজন ({monthsList.length} টি মাস)
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        ক্যাটাগরির ভেতরে প্রতি মাসের হিসাব
                      </span>
                    </div>

                    {monthsList.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-gray-200 bg-white py-6 text-center text-xs text-gray-400">
                        এই ক্যাটাগরিতে এখনো কোনো মাসভিত্তিক লেনদেন পাওয়া যায়নি।
                      </div>
                    ) : (
                      <>
                        {/* Desktop Table View */}
                        <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xs sm:block">
                          <table className="w-full text-left text-xs">
                            <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                              <tr>
                                <th className="px-4 py-3">মাস ও বছর</th>
                                <th className="px-4 py-3 text-center">
                                  এন্ট্রি সংখ্যা
                                </th>
                                <th className="px-4 py-3 text-right">
                                  মোট পরিমাণ
                                </th>
                                <th className="px-4 py-3 text-right">
                                  পরিশোধিত নগদ
                                </th>
                                <th className="px-4 py-3 text-right">বকেয়া</th>
                                <th className="px-4 py-3 text-right">
                                  অবদান (% Share)
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                              {monthsList.map((m) => {
                                const mTotal = isIncome ? m.income : m.expense;
                                const percentage =
                                  totalAmount > 0
                                    ? Math.round((mTotal / totalAmount) * 100)
                                    : 0;

                                return (
                                  <tr
                                    key={m.monthKey}
                                    className="transition-colors hover:bg-blue-50/30"
                                  >
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <div className="flex items-center gap-2">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-xs font-bold text-blue-600">
                                          📅
                                        </span>
                                        <span className="font-bold text-gray-900">
                                          {getMonthName(m.month)} {m.year}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-center whitespace-nowrap">
                                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">
                                        {m.count} টি
                                      </span>
                                    </td>
                                    <td
                                      className={`px-4 py-3 text-right font-bold whitespace-nowrap ${
                                        isIncome
                                          ? "text-emerald-600"
                                          : "text-rose-600"
                                      }`}
                                    >
                                      {isIncome ? "+" : "-"}৳
                                      {formatCurrency(mTotal)}
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap text-gray-800">
                                      ৳{formatCurrency(m.paid)}
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                      {m.due > 0 ? (
                                        <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                                          ৳{formatCurrency(m.due)}
                                        </span>
                                      ) : (
                                        <span className="text-[11px] text-gray-400">
                                          ০ (পরিশোধিত)
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                      <div className="flex items-center justify-end gap-2.5">
                                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                                          <div
                                            className={`h-full rounded-full transition-all duration-300 ${
                                              isIncome
                                                ? "bg-emerald-500"
                                                : "bg-rose-500"
                                            }`}
                                            style={{
                                              width: `${Math.min(
                                                Math.max(percentage, 0),
                                                100
                                              )}%`,
                                            }}
                                          />
                                        </div>
                                        <span className="min-w-[34px] text-[11px] font-bold text-gray-500">
                                          {percentage}%
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Cards View */}
                        <div className="space-y-2.5 sm:hidden">
                          {monthsList.map((m) => {
                            const mTotal = isIncome ? m.income : m.expense;
                            const percentage =
                              totalAmount > 0
                                ? Math.round((mTotal / totalAmount) * 100)
                                : 0;

                            return (
                              <div
                                key={m.monthKey}
                                className="space-y-2 rounded-lg border border-gray-200 bg-white p-3 shadow-2xs"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                                    <span>📅</span>
                                    <span>
                                      {getMonthName(m.month)} {m.year}
                                    </span>
                                  </div>
                                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                                    {m.count} টি এন্ট্রি
                                  </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 border-t border-b border-gray-100 py-2 text-center">
                                  <div>
                                    <span className="block text-[10px] text-gray-400">
                                      মোট পরিমাণ
                                    </span>
                                    <span
                                      className={`text-xs font-bold ${
                                        isIncome
                                          ? "text-emerald-600"
                                          : "text-rose-600"
                                      }`}
                                    >
                                      ৳{formatCurrency(mTotal)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="block text-[10px] text-gray-400">
                                      পরিশোধিত
                                    </span>
                                    <span className="text-xs font-semibold text-gray-800">
                                      ৳{formatCurrency(m.paid)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="block text-[10px] text-gray-400">
                                      বকেয়া
                                    </span>
                                    <span
                                      className={`text-xs font-bold ${
                                        m.due > 0
                                          ? "text-amber-600"
                                          : "text-gray-400"
                                      }`}
                                    >
                                      {m.due > 0
                                        ? `৳${formatCurrency(m.due)}`
                                        : "০"}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-0.5 text-[11px] text-gray-500">
                                  <span>ক্যাটাগরির অবদান ({percentage}%)</span>
                                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                                    <div
                                      className={`h-full rounded-full ${
                                        isIncome
                                          ? "bg-emerald-500"
                                          : "bg-rose-500"
                                      }`}
                                      style={{
                                        width: `${Math.min(
                                          Math.max(percentage, 0),
                                          100
                                        )}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FinanceCategories;
