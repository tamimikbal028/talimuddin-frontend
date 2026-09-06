import { useState } from "react";
import { useParams } from "react-router-dom";
import { useFinanceCategories } from "@/hooks/useBranchFinance";
import { formatCurrency } from "./financeUtils";
import {
  CategoriesTableSkeleton,
  FetchingIndicator,
} from "@/app/shared/LoadingSkeleton/FinanceSkeletons";
import { FaTag } from "react-icons/fa";

const FinanceCategories = () => {
  const { branchId } = useParams<{ branchId: string }>();

  // Filter state (All, Income, Expense)
  const [filterType, setFilterType] = useState<string>("");

  const { data, isLoading, isFetching } = useFinanceCategories(
    branchId as string,
    filterType === "INCOME" || filterType === "EXPENSE" ? filterType : undefined
  );

  const categories = data?.data?.categories ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-bold tracking-wider text-gray-500 uppercase">
            Categories Breakdown
          </h3>
          <FetchingIndicator isFetching={isFetching} isLoading={isLoading} />
        </div>

        {/* Filter buttons */}
        <div className="flex rounded-lg border border-gray-200 bg-white p-1">
          {(
            [
              { id: "", label: "All Categories" },
              { id: "INCOME", label: "Income Only" },
              { id: "EXPENSE", label: "Expense Only" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
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

      {isLoading ? (
        <CategoriesTableSkeleton />
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white py-14 text-center">
          <p className="text-sm text-gray-500">
            No categories recorded with transactions yet.
          </p>
        </div>
      ) : (
        <div
          className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs transition-opacity duration-200 ${
            isFetching ? "opacity-70" : "opacity-100"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50/80 text-xs font-bold tracking-wider text-gray-500 uppercase">
                <tr>
                  <th className="px-5 py-3.5">Category Name</th>
                  <th className="px-5 py-3.5 text-center">Type</th>
                  <th className="px-5 py-3.5 text-right">Income</th>
                  <th className="px-5 py-3.5 text-right">Expense</th>
                  <th className="px-5 py-3.5 text-right">Net Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/80 font-medium text-gray-700">
                {categories.map((cat) => {
                  const netBalance = cat.income - cat.expense;
                  return (
                    <tr
                      key={cat.id}
                      className="border-b border-gray-200/80 transition-colors last:border-b-0 hover:bg-gray-50/70"
                    >
                      {/* Name & Count */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
                            <FaTag className="h-3 w-3" />
                          </div>
                          <span className="font-semibold text-gray-900">
                            {cat.category}
                          </span>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                            {cat.count}
                          </span>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-0.5 text-[10px] font-bold ${
                            cat.type === "INCOME"
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {cat.type === "INCOME" ? "Income" : "Expense"}
                        </span>
                      </td>

                      {/* Total Income */}
                      <td className="px-5 py-4 text-right whitespace-nowrap text-green-600">
                        {cat.income > 0
                          ? `+${formatCurrency(cat.income)}`
                          : "-"}
                      </td>

                      {/* Total Expense */}
                      <td className="px-5 py-4 text-right whitespace-nowrap text-red-600">
                        {cat.expense > 0
                          ? `-${formatCurrency(cat.expense)}`
                          : "-"}
                      </td>

                      {/* Net Balance */}
                      <td
                        className={`px-5 py-4 text-right font-bold whitespace-nowrap ${
                          netBalance >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {netBalance >= 0 ? "+" : ""}
                        {formatCurrency(netBalance)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceCategories;
