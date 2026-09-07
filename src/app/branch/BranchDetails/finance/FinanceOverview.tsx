import { useParams } from "react-router-dom";
import { useFinanceSummary } from "@/hooks/useBranchFinance";
import {
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaChartBar,
  FaHandHoldingUsd,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import { formatCurrency, getMonthName } from "./financeUtils";
import {
  OverviewSkeleton,
  FetchingIndicator,
} from "@/app/shared/LoadingSkeleton/FinanceSkeletons";

const FinanceOverview = () => {
  const { branchId } = useParams<{ branchId: string }>();
  const { data, isLoading, isFetching } = useFinanceSummary(branchId as string);

  const overall = data?.data?.overall;
  const monthlyStats = data?.data?.monthlyStats ?? [];

  const metricCards = [
    {
      label: "Current Balance",
      icon: FaWallet,
      iconBg: "bg-blue-50 text-blue-600",
      amount: overall?.balance ?? 0,
      subtext: "হাতে নগদ ফান্ড (Cash)",
      subtextColor: "text-gray-500",
    },
    {
      label: "Total Income",
      icon: FaArrowUp,
      iconBg: "bg-green-50 text-green-600",
      amount: overall?.income ?? 0,
      subtext: "মোট আয়ের হিসাব",
      subtextColor: "text-green-600",
    },
    {
      label: "Total Expense",
      icon: FaArrowDown,
      iconBg: "bg-red-50 text-red-600",
      amount: overall?.expense ?? 0,
      subtext: "মোট ব্যয়ের হিসাব",
      subtextColor: "text-red-600",
    },
    {
      label: "Total Receivable",
      icon: FaHandHoldingUsd,
      iconBg: "bg-amber-50 text-amber-700",
      amount: overall?.total_receivable ?? 0,
      subtext: "বাকি টাকা আমি পাবো",
      subtextColor: "text-amber-700",
    },
    {
      label: "Total Payable",
      icon: FaFileInvoiceDollar,
      iconBg: "bg-rose-50 text-rose-700",
      amount: overall?.total_payable ?? 0,
      subtext: "বাকি টাকা আমাকে দিতে হবে",
      subtextColor: "text-rose-700",
    },
  ];

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  return (
    <div
      className={`space-y-4 transition-opacity duration-200 sm:space-y-6 ${
        isFetching ? "opacity-75" : "opacity-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase sm:text-sm">
          Financial Overview (আর্থিক সংক্ষিপ্ত বিবরণী)
        </h3>
        <FetchingIndicator isFetching={isFetching} isLoading={isLoading} />
      </div>
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5 sm:gap-4">
        {metricCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-xs transition-shadow hover:shadow-sm sm:p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase sm:text-xs">
                  {card.label}
                </span>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.iconBg}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3">
                <h3 className="text-xl font-extrabold text-gray-950 sm:text-2xl">
                  {formatCurrency(card.amount)}
                </h3>
                <p
                  className={`mt-0.5 text-xs font-medium sm:mt-1 ${card.subtextColor}`}
                >
                  {card.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly Statistics Section */}
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase sm:text-sm">
          <FaChartBar className="h-4 w-4" />
          Monthly Summary & Dues
        </h3>

        {monthlyStats.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white py-10 text-center">
            <p className="text-xs text-gray-500 sm:text-sm">
              No transactions recorded yet in this branch.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            {monthlyStats.map((stat) => {
              const monthBalance = stat.income - stat.expense;
              const hasDue = (stat.receivable ?? 0) > 0 || (stat.payable ?? 0) > 0;

              return (
                <div
                  key={`${stat.year}-${stat.month}`}
                  className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xs transition-shadow hover:shadow-md"
                >
                  {/* Month Header */}
                  <div className="flex items-center justify-between border-b border-gray-50 bg-gray-50/50 px-4 py-3 sm:px-5">
                    <span className="text-xs font-bold text-gray-800 sm:text-sm">
                      {getMonthName(stat.month)} {stat.year}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        monthBalance >= 0
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {monthBalance >= 0 ? "+" : ""}
                      {formatCurrency(monthBalance)}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                    {/* Monthly Totals */}
                    <div className="mb-3 grid grid-cols-2 gap-4 border-b border-gray-50 pb-3">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                          Income
                        </p>
                        <p className="text-xs font-bold text-green-600 sm:text-sm">
                          {formatCurrency(stat.income)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                          Expense
                        </p>
                        <p className="text-xs font-bold text-red-600 sm:text-sm">
                          {formatCurrency(stat.expense)}
                        </p>
                      </div>
                    </div>

                    {/* Dues Status in Month if any */}
                    {hasDue && (
                      <div className="mb-3 flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2 text-xs">
                        {(stat.receivable ?? 0) > 0 && (
                          <div className="text-amber-900">
                            <span className="text-[10px] font-semibold opacity-75">আমি পাবো:</span>{" "}
                            <span className="font-bold">{formatCurrency(stat.receivable || 0)}</span>
                          </div>
                        )}
                        {(stat.payable ?? 0) > 0 && (
                          <div className="text-rose-900">
                            <span className="text-[10px] font-semibold opacity-75">আমাকে দিতে হবে:</span>{" "}
                            <span className="font-bold">{formatCurrency(stat.payable || 0)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Monthly Category Breakdown */}
                    <div className="space-y-2.5">
                      <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                        Breakdown by Category
                      </p>
                      <div className="space-y-2">
                        {stat.breakdown.map((item, idx) => (
                          <div
                            key={`${item.category}-${idx}`}
                            className="flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  item.type === "INCOME"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              />
                              <span className="max-w-36 truncate font-medium text-gray-700 sm:max-w-none">
                                {item.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-semibold text-gray-400">
                                ({item.count})
                              </span>
                              <span
                                className={`font-semibold ${
                                  item.type === "INCOME"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {item.type === "INCOME" ? "+" : "-"}
                                {formatCurrency(item.total)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceOverview;
