import { FaTimes, FaThumbtack, FaCalendarAlt, FaUserTie } from "react-icons/fa";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { Notice } from "@/types";

dayjs.extend(relativeTime);

interface NoticeDetailModalProps {
  notice: Notice | null;
  onClose: () => void;
}

const NoticeDetailModal = ({ notice, onClose }: NoticeDetailModalProps) => {
  if (!notice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 p-6 pb-4">
          <div className="space-y-2 pr-4">
            {notice.is_pinned && (
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50/80 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  <FaThumbtack className="h-2.5 w-2.5" />
                  পিন করা (Pinned)
                </span>
              </div>
            )}

            <h2 className="text-xl font-bold tracking-tight text-gray-900">
              {notice.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <FaCalendarAlt className="h-3 w-3 text-gray-400" />
                {dayjs(notice.created_at).format("DD MMMM, YYYY - hh:mm A")} (
                {dayjs(notice.created_at).fromNow()})
              </span>
              {notice.author && (
                <span className="flex items-center gap-1.5 font-medium text-gray-700">
                  <FaUserTie className="h-3 w-3 text-gray-400" />
                  {notice.author.full_name || notice.author.user_name} (অ্যাডমিন)
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors shrink-0"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 text-sm text-gray-700 leading-relaxed whitespace-pre-line space-y-4">
          {notice.content}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-gray-100 bg-gray-50/60 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors shadow-2xs"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetailModal;
