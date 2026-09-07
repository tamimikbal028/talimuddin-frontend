import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { FaMoneyBillWave, FaHistory, FaCheckCircle } from "react-icons/fa";
import {
  useRecordFinancePayment,
  useFinancePayments,
} from "@/hooks/useBranchFinance";
import { formatCurrency, getMonthName } from "./financeUtils";
import type { FinanceEntry } from "@/types";

interface CollectDueModalProps {
  isOpen: boolean;
  branchId: string;
  entry: FinanceEntry | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const CollectDueModal = ({
  isOpen,
  branchId,
  entry,
  onClose,
  onSuccess,
}: CollectDueModalProps) => {
  const [amount, setAmount] = useState<number | "">("");
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [note, setNote] = useState("");
  const [validationError, setValidationError] = useState("");

  const entryId = entry?.id || "";
  const isIncome = entry?.type === "INCOME";

  const { mutate: recordPayment, isPending } = useRecordFinancePayment(
    branchId,
    entryId
  );

  const { data: paymentsData, isLoading: isLoadingPayments } = useFinancePayments(
    branchId,
    entryId,
    isOpen && !!entryId
  );

  const payments = paymentsData?.data?.payments || [];

  const totalAmount = entry?.total_amount ?? entry?.amount ?? 0;
  const paidAmount = entry?.paid_amount ?? entry?.amount ?? 0;
  const dueAmount = entry?.due_amount ?? 0;

  useEffect(() => {
    if (isOpen && entry) {
      // Default amount to remaining due
      setAmount(dueAmount > 0 ? dueAmount : "");
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setNote("");
      setValidationError("");
    }
  }, [isOpen, entry, dueAmount]);

  if (!isOpen || !entry) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setValidationError("Please enter a valid amount greater than 0");
      return;
    }

    if (numAmount > dueAmount + 0.01) {
      setValidationError(
        `Amount cannot exceed remaining due (${formatCurrency(dueAmount)})`
      );
      return;
    }

    setValidationError("");

    recordPayment(
      {
        amount: numAmount,
        date: paymentDate,
        note: note.trim() || undefined,
      },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      }
    );
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, "0");
    const month = getMonthName(d.getMonth() + 1);
    const year = d.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                isIncome
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <FaMoneyBillWave className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 sm:text-base">
                {isIncome ? "বকেয়া আদায় (আমি পাবো)" : "দেনা পরিশোধ (আমাকে দিতে হবে)"}
              </h2>
              <p className="text-[11px] text-gray-500">
                {entry.category?.name} • {entry.person_name || "N/A"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            title="Close"
          >
            <IoClose className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {/* Due Balance Card */}
            <div className="rounded-xl border border-amber-200 bg-linear-to-br from-amber-50 to-orange-50/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-900">
                  {isIncome
                    ? "অবশিষ্ট টাকা আমি পাবো"
                    : "অবশিষ্ট টাকা আমাকে দিতে হবে"}
                </span>
                <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 text-[10px] font-bold text-amber-900">
                  {entry.payment_status === "DUE" ? "সম্পূর্ণ বাকি" : "আংশিক বাকি"}
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-black text-amber-950">
                  {formatCurrency(dueAmount)}
                </span>
                <div className="text-right text-[11px] text-gray-600">
                  <span>মোট: {formatCurrency(totalAmount)}</span>
                  <span className="mx-1">•</span>
                  <span className="text-green-700">
                    {isIncome ? "আদায়কৃত: " : "পরিশোধিত: "}
                    {formatCurrency(paidAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Input Section */}
            <div className="space-y-3">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700">
                    {isIncome
                      ? "আদায়ের পরিমাণ (আমি পাবো) *"
                      : "পরিশোধের পরিমাণ (আমাকে দিতে হবে) *"}
                  </label>
                  {dueAmount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setAmount(dueAmount);
                        setValidationError("");
                      }}
                      className="cursor-pointer text-[11px] font-bold text-blue-600 hover:text-blue-800"
                    >
                      পুরো বাকি ({dueAmount})
                    </button>
                  )}
                </div>
                <div>
                  <input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => {
                      const val = e.target.value === "" ? "" : Number(e.target.value);
                      setAmount(val);
                      setValidationError("");
                    }}
                    placeholder={`e.g. ${dueAmount}`}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-900 shadow-2xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                    required
                  />
                </div>
                {validationError && (
                  <p className="mt-1 text-xs text-red-600">{validationError}</p>
                )}
              </div>

              {/* Date Input */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700">
                  তারিখ (Payment Date) *
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-gray-300 px-3 py-2 text-xs font-medium text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                  required
                />
              </div>

              {/* Note Input */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                  নোট (Optional Note)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. বিকাশ মারফত বকেয়া পরিশোধ"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                />
              </div>
            </div>

            {/* Payment History Section */}
            {isLoadingPayments ? (
              <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/70 p-3 text-center text-xs text-gray-400">
                পেমেন্ট হিস্ট্রি লোড হচ্ছে...
              </div>
            ) : payments.length > 0 ? (
              <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/70 p-3">
                <h4 className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                  <FaHistory className="h-3 w-3 text-gray-500" />
                  পূর্ববর্তী কিস্তি ও পেমেন্ট হিস্ট্রি ({payments.length})
                </h4>
                <div className="mt-2 divide-y divide-gray-200/60">
                  {payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between py-1.5 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-gray-800">
                          {formatCurrency(p.amount)}
                        </span>
                        {p.note && (
                          <span className="ml-1.5 text-[11px] text-gray-500">
                            ({p.note})
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-500">
                        {formatDate(p.payment_date)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 bg-gray-50/80 px-5 py-3.5">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isPending || dueAmount <= 0}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50"
            >
              <FaCheckCircle className="h-3.5 w-3.5" />
              <span>
                {isPending
                  ? "সেভ হচ্ছে..."
                  : isIncome
                    ? "আদায় নিশ্চিত করুন"
                    : "পরিশোধ নিশ্চিত করুন"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollectDueModal;
