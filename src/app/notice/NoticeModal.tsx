import { useState, useEffect } from "react";
import { FaTimes, FaThumbtack, FaExclamationCircle } from "react-icons/fa";
import type { Notice, CreateNoticePayload } from "@/types";

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  notice?: Notice | null;
  onSubmit: (data: CreateNoticePayload) => Promise<void>;
  isSubmitting?: boolean;
}

const NoticeModal = ({
  isOpen,
  onClose,
  notice,
  onSubmit,
  isSubmitting = false,
}: NoticeModalProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (notice) {
      setTitle(notice.title);
      setContent(notice.content);
      setIsPinned(notice.is_pinned);
      setIsActive(notice.is_active);
    } else {
      setTitle("");
      setContent("");
      setIsPinned(false);
      setIsActive(true);
    }
    setError("");
  }, [notice, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("শিরোনাম আবশ্যক (Title is required)");
      return;
    }
    if (!content.trim()) {
      setError("নোটিশের বিস্তারিত আবশ্যক (Content is required)");
      return;
    }

    setError("");
    await onSubmit({
      title: title.trim(),
      content: content.trim(),
      is_pinned: isPinned,
      is_active: isActive,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {notice ? "নোটিশ সম্পাদনা (Edit Notice)" : "নতুন নোটিশ প্রকাশ (Create Notice)"}
            </h2>
            <p className="text-xs text-gray-500">
              শুধুমাত্র ব্রাঞ্চ এডমিনগণ এই নোটিশটি দেখতে পাবেন
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">
              <FaExclamationCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              শিরোনাম (Title) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="উদা: মাসিক হিসাব জমার শেষ তারিখ..."
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              বিস্তারিত বিবরণ (Notice Content) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="এখানে নোটিশের বিস্তারিত বিবরণ লিখুন..."
              className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all resize-y"
              required
            />
          </div>

          {/* Options: Pin and Active */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/70 p-3">
            <label className="flex items-center gap-2.5 text-xs font-medium text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center gap-1">
                <FaThumbtack className={`h-3 w-3 ${isPinned ? "text-amber-500" : "text-gray-400"}`} />
                শীর্ষে পিন রাখুন (Pin to top)
              </span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>প্রকাশিত (Active)</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              বাতিল (Cancel)
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : notice ? (
                "আপডেট করুন (Save Changes)"
              ) : (
                "নোটিশ প্রকাশ করুন (Publish)"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoticeModal;
