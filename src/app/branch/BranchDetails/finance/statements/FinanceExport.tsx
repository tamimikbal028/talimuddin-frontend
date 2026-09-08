import { useState } from "react";
import { useParams } from "react-router-dom";
import { useFinanceMonthExport } from "@/hooks/useBranchFinance";
import { formatCurrency, getMonthName } from "../financeUtils";
import {
  ExportStatementSkeleton,
  FetchingIndicator,
} from "@/app/shared/LoadingSkeleton/FinanceSkeletons";
import { FaPrint, FaArrowUp, FaArrowDown, FaWallet } from "react-icons/fa";
import branchHooks from "@/hooks/useBranch";

const FinanceExport = () => {
  const { branchId } = useParams<{ branchId: string }>();
  const { data: branchData } = branchHooks.useBranchDetails();
  const branch = branchData?.data?.branch;

  // Date selection state
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<number>(currentMonth);
  const [shouldFetch, setShouldFetch] = useState(true);

  // Years options (last 5 years)
  const years = Array.from({ length: 5 }, (_, idx) => currentYear - idx);

  // Months options
  const months = Array.from({ length: 12 }, (_, idx) => idx + 1);

  const { data, isLoading, isFetching } = useFinanceMonthExport(
    branchId as string,
    year,
    month,
    shouldFetch
  );

  const report = data?.data;
  const entries = report?.entries ?? [];
  const summary = report?.summary;

  const totalIncome =
    summary?.income ??
    entries
      .filter((e) => e.type === "INCOME")
      .reduce((s, e) => s + (e.total_amount ?? e.amount ?? 0), 0);

  const totalExpense =
    summary?.expense ??
    entries
      .filter((e) => e.type === "EXPENSE")
      .reduce((s, e) => s + (e.total_amount ?? e.amount ?? 0), 0);

  const receivable =
    summary?.receivable !== undefined
      ? summary.receivable
      : entries
          .filter((e) => e.type === "INCOME")
          .reduce((s, e) => s + (e.due_amount ?? 0), 0);

  const payable =
    summary?.payable !== undefined
      ? summary.payable
      : entries
          .filter((e) => e.type === "EXPENSE")
          .reduce((s, e) => s + (e.due_amount ?? 0), 0);

  const netDue = receivable - payable;
  const overallNet = totalIncome - totalExpense;

  const handlePrint = () => {
    window.print();
  };

  const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-BD", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-5">
      {/* Dynamic media print stylesheet to hide page shell and remove browser headers/footers when printing */}
      <style>{`
        @page {
          size: auto;
          margin: 0;
        }
        @media print {
          @page {
            size: auto;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm 12mm !important;
            box-sizing: border-box !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
          .print-grid-3 {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }
      `}</style>

      {/* Selectors Bar */}
      <div className="no-print rounded-xl border border-gray-100 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-end gap-4">
          {/* Year selector */}
          <div className="min-w-30 flex-1">
            <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
              Year
            </label>
            <select
              value={year}
              onChange={(e) => {
                setYear(Number(e.target.value));
                setShouldFetch(true);
              }}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Month selector */}
          <div className="min-w-36 flex-1">
            <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
              Month
            </label>
            <select
              value={month}
              onChange={(e) => {
                setMonth(Number(e.target.value));
                setShouldFetch(true);
              }}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {getMonthName(m)}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <FetchingIndicator isFetching={isFetching} isLoading={isLoading} />
            <button
              onClick={handlePrint}
              disabled={isLoading || entries.length === 0}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 disabled:opacity-50"
            >
              <FaPrint className="h-3.5 w-3.5" /> Print Statement
            </button>
          </div>
        </div>
      </div>

      {/* Main Print Container */}
      {isLoading ? (
        <ExportStatementSkeleton />
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white py-14 text-center">
          <p className="text-sm text-gray-500">
            No finance entries recorded for {getMonthName(month)} {year}.
          </p>
        </div>
      ) : (
        <div
          id="print-area"
          className={`space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-opacity duration-200 ${
            isFetching ? "opacity-75" : "opacity-100"
          }`}
        >
          {/* Header (visible in print too) */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              {branch?.name && (
                <h1 className="text-2xl font-black tracking-tight text-gray-950">
                  {branch.name}
                  {branch.location_name && (
                    <span className="ml-2 text-xs font-medium text-gray-500">
                      ({branch.location_name})
                    </span>
                  )}
                </h1>
              )}
              <h2 className="text-base font-bold text-blue-600">
                Monthly Finance Statement
              </h2>
              <p className="mt-0.5 text-xs font-medium text-gray-500">
                Statement Period: {getMonthName(month)} {year}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                Report Generated
              </p>
              <p className="mt-0.5 text-xs font-bold text-gray-700">
                {new Date().toLocaleDateString("en-BD")}
              </p>
            </div>
          </div>

          {/* Quick Metrics (visible in print too) */}
          <div className="print-grid-3 grid grid-cols-1 gap-3.5 rounded-xl border border-gray-200 bg-gray-50/70 p-4 sm:grid-cols-3 sm:gap-4">
            {/* Total Income */}
            <div className="flex flex-col justify-between rounded-lg border border-emerald-100 bg-white p-3.5 shadow-2xs">
              <div>
                <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-gray-500 uppercase sm:text-[11px]">
                  <FaArrowUp className="h-3 w-3 text-emerald-600" /> Total
                  Income
                </p>
                <p className="mt-1 text-base font-black text-emerald-600 sm:text-xl">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
              <div className="mt-2.5 border-t border-gray-100 pt-2 text-[11px]">
                <div className="flex items-center justify-between text-amber-700">
                  <span className="font-medium">বাকি (নিতে হবে):</span>
                  <span className="font-bold">
                    {formatCurrency(receivable)}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Expense */}
            <div className="flex flex-col justify-between rounded-lg border border-rose-100 bg-white p-3.5 shadow-2xs">
              <div>
                <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-gray-500 uppercase sm:text-[11px]">
                  <FaArrowDown className="h-3 w-3 text-rose-600" /> Total
                  Expense
                </p>
                <p className="mt-1 text-base font-black text-rose-600 sm:text-xl">
                  {formatCurrency(totalExpense)}
                </p>
              </div>
              <div className="mt-2.5 border-t border-gray-100 pt-2 text-[11px]">
                <div className="flex items-center justify-between text-rose-700">
                  <span className="font-medium">বাকি (দিতে হবে):</span>
                  <span className="font-bold">{formatCurrency(payable)}</span>
                </div>
              </div>
            </div>

            {/* Net Balance */}
            <div className="flex flex-col justify-between rounded-lg border border-blue-100 bg-white p-3.5 shadow-2xs">
              <div>
                <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-gray-500 uppercase sm:text-[11px]">
                  <FaWallet className="h-3 w-3 text-blue-600" /> Net Balance
                </p>
                <p
                  className={`mt-1 text-base font-black sm:text-xl ${
                    overallNet >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {formatCurrency(overallNet)}
                </p>
              </div>
              <div className="mt-2.5 border-t border-gray-100 pt-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">নেট বাকি:</span>
                  {netDue > 0 ? (
                    <span className="font-bold text-amber-700">
                      পাবো +{formatCurrency(netDue)}
                    </span>
                  ) : netDue < 0 ? (
                    <span className="font-bold text-rose-700">
                      দিতে হবে -{formatCurrency(Math.abs(netDue))}
                    </span>
                  ) : (
                    <span className="font-semibold text-gray-600">
                      বাকি নেই (০)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Printable Table */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="border-b border-gray-200 bg-gray-50/80 font-bold tracking-wider text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Person Name</th>
                  <th className="px-4 py-3">Note</th>
                  <th className="px-4 py-3 text-right">Income</th>
                  <th className="px-4 py-3 text-right">Expense</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/80 font-medium text-gray-700">
                {entries.map((entry) => {
                  const hasDue = (entry.due_amount ?? 0) > 0;
                  const totalAmt = entry.total_amount ?? entry.amount;

                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-gray-200/80 last:border-b-0"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDateShort(entry.date)}
                      </td>
                      <td className="px-4 py-3 font-bold whitespace-nowrap text-gray-900">
                        {entry.category?.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {entry.person_name || "-"}
                      </td>
                      <td className="max-w-50 truncate px-4 py-3 text-gray-600">
                        {entry.note || "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-bold whitespace-nowrap text-emerald-600">
                        {entry.type === "INCOME" ? (
                          <div>
                            <span>+{formatCurrency(totalAmt)}</span>
                            {hasDue && (
                              <p className="text-[10px] font-semibold text-amber-700">
                                বাকি: {formatCurrency(entry.due_amount ?? 0)}
                              </p>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-bold whitespace-nowrap text-rose-600">
                        {entry.type === "EXPENSE" ? (
                          <div>
                            <span>-{formatCurrency(totalAmt)}</span>
                            {hasDue && (
                              <p className="text-[10px] font-semibold text-rose-700">
                                বাকি: {formatCurrency(entry.due_amount ?? 0)}
                              </p>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
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

export default FinanceExport;
