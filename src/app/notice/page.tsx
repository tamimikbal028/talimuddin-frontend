import { useState } from "react";
import {
  FaBullhorn,
  FaPlus,
  FaThumbtack,
  FaSearch,
  FaCalendarAlt,
  FaEdit,
  FaTrashAlt,
  FaLock,
} from "react-icons/fa";
import authHooks from "@/hooks/useAuth";
import {
  useNotices,
  useCreateNotice,
  useUpdateNotice,
  useDeleteNotice,
} from "@/hooks/useNotice";
import NoticeModal from "./NoticeModal";
import NoticeDetailModal from "./NoticeDetailModal";
import { confirmDelete } from "@/utils/sweetAlert";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { Notice, CreateNoticePayload } from "@/types";

dayjs.extend(relativeTime);

const NoticePage = () => {
  const { is_app_admin, can_access_notices, isCheckingAuth } =
    authHooks.useUser();

  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [readingNotice, setReadingNotice] = useState<Notice | null>(null);

  // Queries & Mutations
  const queryParams = {
    q: searchQuery.trim() || undefined,
  };

  const { data: noticesData, isLoading } = useNotices(
    queryParams,
    can_access_notices
  );
  const { mutateAsync: createNotice, isPending: isCreating } =
    useCreateNotice();
  const { mutateAsync: updateNotice, isPending: isUpdating } =
    useUpdateNotice();
  const { mutateAsync: deleteNotice } = useDeleteNotice();

  const notices = noticesData?.data?.notices || [];

  // Split into pinned and non-pinned
  const pinnedNotices = notices.filter((n) => n.is_pinned);
  const regularNotices = notices.filter((n) => !n.is_pinned);

  // Access check guard
  if (!isCheckingAuth && !can_access_notices) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 shadow-xs ring-1 ring-red-200">
          <FaLock className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-gray-900">
          অনুমতি নেই (Access Restricted)
        </h2>
        <p className="mt-1.5 max-w-md text-xs text-gray-500">
          এই নোটিশ বোর্ডটি শুধুমাত্র অ্যাপ অ্যাডমিনিস্ট্রেটর এবং ব্রাঞ্চ
          অ্যাডমিনদের জন্য সংরক্ষিত। সাধারণ সদস্য বা মডারেটরদের জন্য এটি
          উন্মুক্ত নয়।
        </p>
      </div>
    );
  }

  // Handle Form Submit (Create / Edit)
  const handleFormSubmit = async (formData: CreateNoticePayload) => {
    try {
      if (editingNotice) {
        await updateNotice({
          noticeId: editingNotice.id,
          data: formData,
        });
      } else {
        await createNotice(formData);
      }
      setIsModalOpen(false);
      setEditingNotice(null);
    } catch {
      // Error handled by mutation onError
    }
  };

  // Handle Delete
  const handleDelete = async (notice: Notice, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = await confirmDelete(`নোটিশ: "${notice.title}"`);
    if (confirmed) {
      await deleteNotice(notice.id);
    }
  };

  const renderNoticeCard = (notice: Notice, isPinnedView = false) => (
    <div
      key={notice.id}
      onClick={() => setReadingNotice(notice)}
      className={`group relative flex cursor-pointer flex-col justify-between rounded-2xl border p-4 transition-all duration-200 hover:shadow-md sm:p-5 ${
        isPinnedView
          ? "border-amber-200/90 bg-linear-to-br from-amber-50/40 via-white to-amber-50/20 shadow-2xs"
          : "border-gray-200/80 bg-white hover:border-gray-300"
      }`}
    >
      <div>
        {/* Optional Pinned / Draft Badges (rendered only if present) */}
        {(notice.is_pinned || (!notice.is_active && is_app_admin)) && (
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {!notice.is_active && is_app_admin && (
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                অপ্রকাশিত (Draft)
              </span>
            )}
          </div>
        )}

        {/* Title & Admin Controls Row */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base leading-snug font-bold text-gray-900 transition-colors group-hover:text-blue-600">
            {notice.title}
          </h3>

          {/* Admin Controls (Always visible, clean buttons) */}
          {is_app_admin && (
            <div
              className="flex shrink-0 items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setEditingNotice(notice);
                  setIsModalOpen(true);
                }}
                title="সম্পাদনা করুন"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200/80 bg-gray-50 text-gray-600 shadow-2xs transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
              >
                <FaEdit className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={(e) => handleDelete(notice, e)}
                title="মুছে ফেলুন"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200/80 bg-gray-50 text-gray-600 shadow-2xs transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              >
                <FaTrashAlt className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* Snippet */}
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-600">
          {notice.content}
        </p>
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100/80 pt-3 text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5">
          <FaCalendarAlt className="h-3 w-3 text-gray-400" />
          {dayjs(notice.created_at).fromNow()}
        </span>

        <span className="font-semibold text-blue-600 transition-transform group-hover:translate-x-0.5">
          বিস্তারিত দেখুন &rarr;
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/20">
            <FaBullhorn className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              নোটিশ বোর্ড (Notice Board)
            </h1>
            <p className="text-xs text-gray-500">
              ব্রাঞ্চ অ্যাডমিনদের জন্য সেন্ট্রাল নোটিশ ও দিকনির্দেশনা
            </p>
          </div>
        </div>

        {is_app_admin && (
          <button
            type="button"
            onClick={() => {
              setEditingNotice(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 active:scale-[0.99]"
          >
            <FaPlus className="h-3 w-3" />
            <span>নতুন নোটিশ লিখুন</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <FaSearch className="absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="নোটিশ খুঁজুন..."
          className="w-full rounded-xl border border-gray-200/80 bg-white py-2.5 pr-3.5 pl-9 text-xs text-gray-900 shadow-2xs transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
        />
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse space-y-3 rounded-2xl border border-gray-200/80 bg-white p-5"
            >
              <div className="h-4 w-20 rounded-md bg-gray-200" />
              <div className="h-5 w-3/4 rounded-md bg-gray-200" />
              <div className="space-y-1.5">
                <div className="h-3 w-full rounded-md bg-gray-200" />
                <div className="h-3 w-4/5 rounded-md bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : notices.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <FaBullhorn className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-gray-900">
            কোন নোটিশ পাওয়া যায়নি
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            {searchQuery
              ? "আপনার খোঁজা শব্দ দিয়ে কোনো নোটিশ মেলেনি।"
              : "বর্তমানে কোনো প্রকাশিত নোটিশ নেই।"}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Pinned Section */}
          {pinnedNotices.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                <FaThumbtack className="h-3 w-3" />
                <span>পিন করা নোটিশ ({pinnedNotices.length})</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {pinnedNotices.map((n) => renderNoticeCard(n, true))}
              </div>
            </div>
          )}

          {/* Regular Notices */}
          {regularNotices.length > 0 && (
            <div className="space-y-2.5">
              {pinnedNotices.length > 0 && (
                <div className="text-xs font-bold text-gray-700">
                  <span>অন্যান্য নোটিশ ({regularNotices.length})</span>
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                {regularNotices.map((n) => renderNoticeCard(n, false))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal (App Admin only) */}
      <NoticeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingNotice(null);
        }}
        notice={editingNotice}
        onSubmit={handleFormSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Notice Details Modal */}
      <NoticeDetailModal
        notice={readingNotice}
        onClose={() => setReadingNotice(null)}
      />
    </div>
  );
};

export default NoticePage;
