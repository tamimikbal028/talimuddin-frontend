import { useState } from "react";
import { useParams } from "react-router-dom";
import { useFinanceMonthExport } from "@/hooks/useBranchFinance";
import { formatCurrency, getMonthName } from "./financeUtils";
import { FaPrint, FaArrowUp, FaArrowDown, FaWallet } from "react-icons/fa";

const FinanceExport = () => {
  const { branchId } = useParams<{ branchId: string }>();

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

  const { data, isLoading } = useFinanceMonthExport(
    branchId as string,
    year,
    month,
    shouldFetch
  );

  const report = data?.data;
  const entries = report?.entries ?? [];
  const summary = report?.summary;

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
      {/* Dynamic media print stylesheet to hide page shell when printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
          }
          .no-print {
            display: none !important;
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
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
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
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {getMonthName(m)}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
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
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white py-14 text-center">
          <p className="text-sm text-gray-500">
            No finance entries recorded for {getMonthName(month)} {year}.
          </p>
        </div>
      ) : (
        <div
          id="print-area"
          className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          {/* Header (visible in print too) */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">
                Monthly Finance Statement
              </h2>
              <p className="mt-1 text-xs font-semibold text-gray-500">
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
          <div className="grid grid-cols-3 gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
            <div className="space-y-1">
              <p className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                <FaArrowUp className="h-2.5 w-2.5 text-green-500" /> Total
                Income
              </p>
              <p className="text-sm font-extrabold text-green-600">
                {formatCurrency(summary?.income ?? 0)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                <FaArrowDown className="h-2.5 w-2.5 text-red-500" /> Total
                Expense
              </p>
              <p className="text-sm font-extrabold text-red-600">
                {formatCurrency(summary?.expense ?? 0)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                <FaWallet className="h-2.5 w-2.5 text-blue-500" /> Net Balance
              </p>
              <p
                className={`text-sm font-extrabold ${
                  (summary?.balance ?? 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatCurrency(summary?.balance ?? 0)}
              </p>
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
                {entries.map((entry) => (
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
                    <td className="px-4 py-3 text-right font-bold whitespace-nowrap text-green-600">
                      {entry.type === "INCOME"
                        ? `+${formatCurrency(entry.amount)}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-bold whitespace-nowrap text-red-600">
                      {entry.type === "EXPENSE"
                        ? `-${formatCurrency(entry.amount)}`
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceExport;
