import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import {
  FaShieldAlt,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaCopy,
  FaCheck,
  FaLock,
  FaInfoCircle,
} from "react-icons/fa";
import {
  useBranchActionCode,
  useUpdateBranchActionCode,
} from "@/hooks/useBranchFinance";
import { toast } from "sonner";

interface ModeratorCodeModalProps {
  isOpen: boolean;
  branchId: string;
  onClose: () => void;
}

const ModeratorCodeModal = ({
  isOpen,
  branchId,
  onClose,
}: ModeratorCodeModalProps) => {
  const { data, isLoading, isError } = useBranchActionCode(
    branchId,
    isOpen && !!branchId
  );
  const { mutate: updateActionCode, isPending: isUpdating } =
    useUpdateBranchActionCode(branchId);

  const currentCode = data?.data?.actionCode || "1234";

  const [showCurrentCode, setShowCurrentCode] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form states for updating code
  const [newCode, setNewCode] = useState("");
  const [showNewCode, setShowNewCode] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setShowCurrentCode(false);
      setCopied(false);
      setNewCode("");
      setShowNewCode(false);
      setFormError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!currentCode) return;
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    toast.success("সিকিউরিটি কোড কপি করা হয়েছে!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCode.trim();

    if (!trimmed) {
      setFormError("নতুন কোড প্রদান করা আবশ্যক");
      return;
    }
    if (trimmed.length < 4 || trimmed.length > 20) {
      setFormError("কোড অবশ্যই ৪ থেকে ২০ অক্ষরের মধ্যে হতে হবে");
      return;
    }

    setFormError("");
    updateActionCode(trimmed, {
      onSuccess: () => {
        setNewCode("");
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="animate-in fade-in fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="animate-in fade-in zoom-in-95 relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-200">
        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-gray-100 bg-linear-to-r from-blue-50/80 via-white to-indigo-50/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <FaShieldAlt className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 sm:text-lg">
                মডারেটর সিকিউরিটি কোড
              </h2>
              <p className="text-xs font-medium text-gray-500">
                এন্ট্রি এডিট ও ডিলিট অ্যাকশন ভেরিফিকেশন
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <IoClose className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 overflow-y-auto p-5 text-sm text-gray-700">
          {/* Info Notice Banner */}
          <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs leading-relaxed text-blue-900">
            <FaInfoCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <div>
              <p className="font-semibold">ব্রাঞ্চ এডমিন নির্দেশনা:</p>
              <p className="text-blue-800">
                ব্রাঞ্চ এডমিন হিসেবে আপনার হিসাব এডিট বা ডিলিট করতে কোডের
                প্রয়োজন নেই। কিন্তু মডারেটররা কোনো হিসাব এডিট অথবা ডিলিট করতে
                চাইলে তাদেরকে অবশ্যই এই কোডটি ব্যবহার করতে হবে।
              </p>
            </div>
          </div>

          {/* Current Code Display Box */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                বর্তমান অ্যাকশন কোড
              </span>
              <button
                type="button"
                onClick={() => setShowCurrentCode((prev) => !prev)}
                className="flex cursor-pointer items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                {showCurrentCode ? (
                  <>
                    <FaEyeSlash className="h-3 w-3" /> <span>লুকান</span>
                  </>
                ) : (
                  <>
                    <FaEye className="h-3 w-3" /> <span>দেখুন</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-2.5 flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5">
              <div className="flex items-center gap-2.5">
                <FaKey className="h-4 w-4 text-amber-500" />
                {isLoading ? (
                  <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                ) : isError ? (
                  <span className="text-xs text-red-500">লোড করা সম্ভব হয়নি</span>
                ) : (
                  <span className="font-mono text-base font-bold tracking-widest text-gray-900">
                    {showCurrentCode ? currentCode : "••••••••"}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleCopy}
                disabled={isLoading || isError}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
                title="Copy Code"
              >
                {copied ? (
                  <>
                    <FaCheck className="h-3 w-3 text-emerald-600" />
                    <span className="text-emerald-700">কপি হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <FaCopy className="h-3 w-3 text-gray-500" />
                    <span>কপি</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Change Code Form */}
          <form onSubmit={handleUpdate} className="space-y-3 pt-1">
            <label className="block text-xs font-bold text-gray-700">
              নতুন সিকিউরিটি কোড সেট করুন
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FaLock className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <input
                type={showNewCode ? "text" : "password"}
                value={newCode}
                onChange={(e) => {
                  setNewCode(e.target.value);
                  if (formError) setFormError("");
                }}
                placeholder="নতুন কোড লিখুন (যেমন: 4589)"
                maxLength={20}
                className={`w-full rounded-xl border bg-white py-2.5 pr-10 pl-9 font-mono text-sm tracking-widest text-gray-900 transition-colors focus:ring-2 focus:ring-blue-500/20 focus:outline-none ${
                  formError
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewCode((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                {showNewCode ? (
                  <FaEyeSlash className="h-4 w-4" />
                ) : (
                  <FaEye className="h-4 w-4" />
                )}
              </button>
            </div>

            {formError && (
              <p className="text-xs font-medium text-red-500">{formError}</p>
            )}

            <button
              type="submit"
              disabled={isUpdating || !newCode.trim()}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <span>কোড পরিবর্তন সংরক্ষণ করুন</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModeratorCodeModal;
