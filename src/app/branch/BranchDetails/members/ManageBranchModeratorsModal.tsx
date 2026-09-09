import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  FaTimes,
  FaUserCheck,
  FaTrash,
  FaUserPlus,
  FaSearch,
  FaUser,
  FaCheck,
  FaListUl,
  FaEdit,
  FaFilter,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import branchHooks from "@/hooks/useBranch";
import { useCategoriesList } from "@/hooks/useBranchFinance";
import confirm from "@/utils/sweetAlert";
import type { BranchModeratorItem, SearchUserItem } from "@/types";

interface ManageBranchModeratorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchName: string;
}

const ManageBranchModeratorsModal = ({
  isOpen,
  onClose,
  branchName,
}: ManageBranchModeratorsModalProps) => {
  const { branchId } = useParams();
  const [activeTab, setActiveTab] = useState<"list" | "add">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<SearchUserItem | null>(null);

  // Category permissions state for "Add"
  const [categoryMode, setCategoryMode] = useState<"ALL" | "SPECIFIC">("ALL");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // Edit category permissions state for an existing moderator
  const [editingModerator, setEditingModerator] =
    useState<BranchModeratorItem | null>(null);
  const [editCategoryMode, setEditCategoryMode] = useState<"ALL" | "SPECIFIC">(
    "ALL"
  );
  const [editSelectedCategoryIds, setEditSelectedCategoryIds] = useState<
    string[]
  >([]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset state on open/close
  useEffect(() => {
    if (!isOpen) {
      setActiveTab("list");
      setSearchTerm("");
      setDebouncedSearch("");
      setSelectedUser(null);
      setCategoryMode("ALL");
      setSelectedCategoryIds([]);
      setEditingModerator(null);
    }
  }, [isOpen]);

  // Query categories of this branch
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useCategoriesList(branchId || "");
  const categories = categoriesData?.data?.categories || [];
  const incomeCategories = categories.filter((c) => c.type === "INCOME");
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  // Query moderators
  const { data: moderatorsData, isLoading: isLoadingModerators } =
    branchHooks.useBranchModerators();
  const { mutate: removeModerator, isPending: isRemoving } =
    branchHooks.useRemoveBranchModerator();

  // Query searchable users when in "add" tab
  const { data: usersData, isLoading: isLoadingUsers } =
    branchHooks.useSearchUsers(debouncedSearch, isOpen && activeTab === "add");
  const users = usersData?.data.users || [];

  // Mutations
  const { mutate: addModerator, isPending: isAdding } =
    branchHooks.useAddBranchModerator();
  const { mutate: updateModerator, isPending: isUpdating } =
    branchHooks.useUpdateBranchModerator();

  if (!isOpen) return null;

  const moderators: BranchModeratorItem[] =
    moderatorsData?.data?.moderators || [];

  const handleRemove = async (moderator: BranchModeratorItem) => {
    const moderatorName =
      moderator.user?.full_name || moderator.user?.user_name || "Moderator";
    const ok = await confirm({
      title: "Remove Branch Moderator?",
      text: `Are you sure you want to remove ${moderatorName} from being a moderator of this branch?`,
      confirmButtonText: "Yes, remove",
      confirmButtonColor: "#dc2626",
      isDanger: true,
      icon: "warning",
    });

    if (ok) {
      removeModerator(moderator.id);
    }
  };

  const toggleCategory = (id: string, isEditing = false) => {
    if (isEditing) {
      setEditSelectedCategoryIds((prev) =>
        prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
      );
    } else {
      setSelectedCategoryIds((prev) =>
        prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
      );
    }
  };

  const handleAddModerator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || isAdding) return;

    const allowed_category_ids =
      categoryMode === "SPECIFIC" && selectedCategoryIds.length > 0
        ? selectedCategoryIds
        : null;

    addModerator(
      {
        user_id: selectedUser.id,
        allowed_category_ids,
      },
      {
        onSuccess: () => {
          setSelectedUser(null);
          setSearchTerm("");
          setCategoryMode("ALL");
          setSelectedCategoryIds([]);
          setActiveTab("list");
        },
      }
    );
  };

  const handleOpenEditCategories = (moderator: BranchModeratorItem) => {
    setEditingModerator(moderator);
    const catIds = moderator.allowed_category_ids;
    if (catIds && Array.isArray(catIds) && catIds.length > 0) {
      setEditCategoryMode("SPECIFIC");
      setEditSelectedCategoryIds(catIds);
    } else {
      setEditCategoryMode("ALL");
      setEditSelectedCategoryIds([]);
    }
  };

  const handleSaveEditCategories = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModerator || isUpdating) return;

    const allowed_category_ids =
      editCategoryMode === "SPECIFIC" && editSelectedCategoryIds.length > 0
        ? editSelectedCategoryIds
        : null;

    updateModerator(
      {
        memberId: editingModerator.id,
        data: { allowed_category_ids },
      },
      {
        onSuccess: () => {
          setEditingModerator(null);
        },
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={
          isAdding || isRemoving || isUpdating ? undefined : onClose
        }
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 shadow-2xs">
              <FaUserCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 sm:text-lg">
                Manage Branch Moderators
              </h2>
              <p className="text-xs text-gray-500">
                {branchName} • {moderators.length} Assigned
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isAdding || isRemoving || isUpdating}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
            aria-label="Close"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 bg-gray-50/70 p-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${
              activeTab === "list"
                ? "bg-white text-purple-600 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FaListUl className="h-3.5 w-3.5" />
            <span>Current Moderators ({moderators.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("add")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${
              activeTab === "add"
                ? "bg-white text-purple-600 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FaUserPlus className="h-3.5 w-3.5" />
            <span>Add Moderator</span>
          </button>
        </div>

        {/* Tab 1: Current Moderators List */}
        {activeTab === "list" && (
          <div className="flex-1 space-y-2.5 overflow-y-auto p-4 sm:p-5">
            {isLoadingModerators ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                <p className="mt-2 text-xs font-medium">
                  Loading branch moderators...
                </p>
              </div>
            ) : moderators.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
                <FaUserCheck className="mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm font-semibold text-gray-700">
                  No Branch Moderators Found
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  Click "+ Add Moderator" to assign a moderator to this branch.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("add")}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-purple-700"
                >
                  <FaUserPlus className="h-3.5 w-3.5" />
                  <span>Add Moderator Now</span>
                </button>
              </div>
            ) : (
              moderators.map((moderator) => {
                const u = moderator.user;
                const name = u?.full_name || u?.user_name || "Moderator";
                const isRestricted =
                  Array.isArray(moderator.allowed_categories) &&
                  moderator.allowed_categories.length > 0;

                return (
                  <div
                    key={moderator.id}
                    className="flex flex-col gap-2.5 rounded-xl border border-gray-200/90 bg-white p-3.5 shadow-2xs transition-colors hover:border-gray-300"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        {u?.avatar ? (
                          <img
                            src={u.avatar}
                            alt={name}
                            className="h-10 w-10 shrink-0 rounded-full object-cover shadow-2xs"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-700 shadow-2xs">
                            {name.charAt(0).toUpperCase() || "M"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-gray-900 sm:text-sm">
                            {name}
                          </p>
                          <p className="truncate text-[11px] text-gray-500">
                            @{u?.user_name || "unknown"}{" "}
                            {u?.email && `• ${u.email}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Edit Category Access Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditCategories(moderator)}
                          disabled={isRemoving || isUpdating}
                          title="Edit Category Permissions"
                          className="flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50/80 px-2.5 py-1.5 text-xs font-semibold text-purple-700 transition-colors hover:border-purple-300 hover:bg-purple-100 active:scale-95 disabled:opacity-50"
                        >
                          <FaEdit className="h-3 w-3" />
                          <span className="hidden sm:inline">Permissions</span>
                        </button>

                        {/* Remove Moderator Button */}
                        <button
                          type="button"
                          onClick={() => handleRemove(moderator)}
                          disabled={isRemoving || isUpdating}
                          title="Remove this branch moderator"
                          className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/80 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:border-red-300 hover:bg-red-100 active:scale-95 disabled:opacity-50"
                        >
                          <FaTrash className="h-3 w-3" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>

                    {/* Assigned Categories Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 border-t border-gray-100 pt-2">
                      {isRestricted ? (
                        <>
                          <span className="text-[11px] font-semibold text-gray-500">
                            Allowed Categories ({moderator.allowed_categories!.length}):
                          </span>
                          {moderator.allowed_categories!.map((cat) => (
                            <span
                              key={cat.id}
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
                                cat.type === "INCOME"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  cat.type === "INCOME"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              />
                              {cat.name}
                            </span>
                          ))}
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700 border border-purple-200">
                          <FaCheck className="h-2.5 w-2.5 text-purple-600" />
                          সকল ক্যাটাগরি (All Categories Allowed)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Add New Moderator */}
        {activeTab === "add" && (
          <form
            onSubmit={handleAddModerator}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
              {/* Search Input */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Search User
                </label>
                <div className="relative">
                  <FaSearch className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-xs text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, username, or email..."
                    autoFocus
                    disabled={isAdding}
                    className="w-full rounded-xl border border-gray-300 py-2.5 pr-4 pl-9 text-xs text-gray-900 shadow-2xs transition-colors placeholder:text-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none sm:text-sm"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-xs text-gray-400 hover:text-gray-600"
                    >
                      <IoClose className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-gray-400">
                  Search active platform users to appoint as Branch Moderator
                </p>
              </div>

              {/* Users List Box */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Select User{" "}
                  {selectedUser && (
                    <span className="font-medium text-purple-600">
                      (1 selected: {selectedUser.full_name})
                    </span>
                  )}
                </label>

                <div className="max-h-44 min-h-28 space-y-1.5 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50/50 p-2">
                  {isLoadingUsers ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                      <p className="mt-2 text-xs">Searching users...</p>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
                      <FaUser className="mx-auto h-6 w-6 text-gray-300" />
                      <p className="mt-2 text-xs font-medium text-gray-500">
                        {searchTerm
                          ? "No users match your search"
                          : "Type a name or email to search users"}
                      </p>
                    </div>
                  ) : (
                    users.map((u) => {
                      const isAlreadyAdmin = !!u.branch_role?.is_admin;
                      const isAlreadyModerator = !!u.branch_role?.is_moderator;
                      const isAppAdmin =
                        !!u.is_app_admin || u.user_type === "ADMIN";
                      const isDisabled =
                        isAlreadyAdmin || isAlreadyModerator || isAppAdmin;
                      const isSelected = selectedUser?.id === u.id;

                      return (
                        <div
                          key={u.id}
                          onClick={() => {
                            if (!isDisabled) setSelectedUser(u);
                          }}
                          className={`flex items-center justify-between gap-3 rounded-lg border p-2.5 transition-all select-none ${
                            isDisabled
                              ? "cursor-not-allowed border-gray-200 bg-gray-100/70 opacity-75"
                              : isSelected
                                ? "cursor-pointer border-purple-500 bg-purple-50/90 shadow-2xs ring-1 ring-purple-500"
                                : "cursor-pointer border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            {u.avatar ? (
                              <img
                                src={u.avatar}
                                alt={u.full_name}
                                className="h-9 w-9 shrink-0 rounded-full object-cover shadow-2xs"
                              />
                            ) : (
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700 shadow-2xs">
                                {u.full_name?.charAt(0).toUpperCase() || "U"}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-gray-900 sm:text-sm">
                                {u.full_name}
                              </p>
                              <p className="truncate text-[11px] text-gray-500">
                                @{u.user_name} {u.email && `• ${u.email}`}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isAppAdmin ? (
                              <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700">
                                App Admin
                              </span>
                            ) : isAlreadyAdmin ? (
                              <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                                Already Admin
                              </span>
                            ) : isAlreadyModerator ? (
                              <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-700">
                                Already Moderator
                              </span>
                            ) : isSelected ? (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-white shadow-2xs">
                                <FaCheck className="h-2.5 w-2.5" />
                              </div>
                            ) : (
                              <div className="h-5 w-5 rounded-full border border-gray-300 bg-white" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Category Permissions Section */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-gray-800">
                      ক্যাটাগরি অনুমতি (Category Access)
                    </label>
                    <p className="text-[11px] text-gray-500">
                      মডারেটর কোন কোন ক্যাটাগরিতে এন্ট্রি যোগ করতে পারবে নির্ধারণ করুন
                    </p>
                  </div>
                  {categoryMode === "SPECIFIC" && (
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-full">
                      {selectedCategoryIds.length} ক্যাটাগরি সিলেক্টেড
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryMode("ALL");
                      setSelectedCategoryIds([]);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                      categoryMode === "ALL"
                        ? "border-purple-600 bg-purple-50 text-purple-700 shadow-2xs ring-1 ring-purple-600"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <FaCheck
                      className={`h-3 w-3 ${
                        categoryMode === "ALL" ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <span>সকল ক্যাটাগরি (All)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryMode("SPECIFIC")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                      categoryMode === "SPECIFIC"
                        ? "border-purple-600 bg-purple-50 text-purple-700 shadow-2xs ring-1 ring-purple-600"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <FaFilter
                      className={`h-3 w-3 ${
                        categoryMode === "SPECIFIC" ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <span>নির্দিষ্ট ক্যাটাগরি (Specific)</span>
                  </button>
                </div>

                {categoryMode === "SPECIFIC" && (
                  <div className="space-y-3 pt-2 border-t border-gray-200/80">
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-gray-500 font-medium">
                        ক্যাটাগরি বাছাই করুন:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCategoryIds(categories.map((c) => c.id))
                          }
                          className="text-purple-600 font-bold hover:underline"
                        >
                          সব নির্বাচন
                        </button>
                        <span className="text-gray-300">•</span>
                        <button
                          type="button"
                          onClick={() => setSelectedCategoryIds([])}
                          className="text-gray-500 font-bold hover:underline"
                        >
                          ক্লিয়ার
                        </button>
                      </div>
                    </div>

                    {isLoadingCategories ? (
                      <div className="py-4 text-center text-xs text-gray-400">
                        Loading categories...
                      </div>
                    ) : categories.length === 0 ? (
                      <div className="py-3 text-center text-xs text-gray-500">
                        এই ব্রাঞ্চে কোনো ক্যাটাগরি নেই।
                      </div>
                    ) : (
                      <div className="max-h-44 space-y-3 overflow-y-auto pr-1">
                        {incomeCategories.length > 0 && (
                          <div>
                            <p className="mb-1.5 text-[11px] font-bold text-green-700 flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              আয় / Income Categories ({incomeCategories.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {incomeCategories.map((cat) => {
                                const isChecked = selectedCategoryIds.includes(
                                  cat.id
                                );
                                return (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => toggleCategory(cat.id)}
                                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition-all ${
                                      isChecked
                                        ? "border-green-600 bg-green-100 text-green-800 shadow-2xs font-semibold"
                                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                    }`}
                                  >
                                    <div
                                      className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                                        isChecked
                                          ? "border-green-600 bg-green-600 text-white"
                                          : "border-gray-300 bg-white"
                                      }`}
                                    >
                                      {isChecked && (
                                        <FaCheck className="h-2 w-2" />
                                      )}
                                    </div>
                                    <span>{cat.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {expenseCategories.length > 0 && (
                          <div>
                            <p className="mb-1.5 text-[11px] font-bold text-red-700 flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              ব্যয় / Expense Categories ({expenseCategories.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {expenseCategories.map((cat) => {
                                const isChecked = selectedCategoryIds.includes(
                                  cat.id
                                );
                                return (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => toggleCategory(cat.id)}
                                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition-all ${
                                      isChecked
                                        ? "border-red-600 bg-red-100 text-red-800 shadow-2xs font-semibold"
                                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                    }`}
                                  >
                                    <div
                                      className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                                        isChecked
                                          ? "border-red-600 bg-red-600 text-white"
                                          : "border-gray-300 bg-white"
                                      }`}
                                    >
                                      {isChecked && (
                                        <FaCheck className="h-2 w-2" />
                                      )}
                                    </div>
                                    <span>{cat.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {categoryMode === "SPECIFIC" &&
                      selectedCategoryIds.length === 0 && (
                        <p className="text-[11px] text-amber-600 font-medium">
                          ⚠️ নির্দিষ্ট ক্যাটাগরি মোডে অন্তত ১টি ক্যাটাগরি নির্বাচন করুন অথবা "সকল ক্যাটাগরি" নির্বাচন করুন।
                        </p>
                      )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons for Tab 2 */}
            <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 px-5 py-3">
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                disabled={isAdding}
                className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:text-sm"
              >
                Back to List
              </button>
              <button
                type="submit"
                disabled={
                  !selectedUser ||
                  isAdding ||
                  (categoryMode === "SPECIFIC" &&
                    selectedCategoryIds.length === 0)
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-purple-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
              >
                {isAdding ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Adding Moderator...
                  </>
                ) : (
                  <>
                    <FaUserCheck className="h-3.5 w-3.5" />
                    Add as Moderator
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer for Tab 1 */}
        {activeTab === "list" && (
          <div className="flex items-center justify-end border-t border-gray-100 px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition-colors hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Nested Modal: Edit Category Permissions */}
      {editingModerator && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => !isUpdating && setEditingModerator(null)}
          />
          <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200/80 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 shadow-2xs">
                  <FaEdit className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 sm:text-base">
                    ক্যাটাগরি অনুমতি পরিবর্তন
                  </h3>
                  <p className="text-xs text-gray-500">
                    মডারেটর: {editingModerator.user?.full_name || "Moderator"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingModerator(null)}
                disabled={isUpdating}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>

            {/* Content Form */}
            <form
              onSubmit={handleSaveEditCategories}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <div className="flex-1 space-y-3.5 overflow-y-auto p-4 sm:p-5">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditCategoryMode("ALL");
                      setEditSelectedCategoryIds([]);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                      editCategoryMode === "ALL"
                        ? "border-purple-600 bg-purple-50 text-purple-700 shadow-2xs ring-1 ring-purple-600"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <FaCheck
                      className={`h-3 w-3 ${
                        editCategoryMode === "ALL"
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />
                    <span>সকল ক্যাটাগরি (All)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditCategoryMode("SPECIFIC")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                      editCategoryMode === "SPECIFIC"
                        ? "border-purple-600 bg-purple-50 text-purple-700 shadow-2xs ring-1 ring-purple-600"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <FaFilter
                      className={`h-3 w-3 ${
                        editCategoryMode === "SPECIFIC"
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />
                    <span>নির্দিষ্ট ক্যাটাগরি (Specific)</span>
                  </button>
                </div>

                {editCategoryMode === "SPECIFIC" && (
                  <div className="space-y-3 pt-2 border-t border-gray-200/80">
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-gray-500 font-medium">
                        ক্যাটাগরি বাছাই করুন ({editSelectedCategoryIds.length} সিলেক্টেড):
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setEditSelectedCategoryIds(
                              categories.map((c) => c.id)
                            )
                          }
                          className="text-purple-600 font-bold hover:underline"
                        >
                          সব নির্বাচন
                        </button>
                        <span className="text-gray-300">•</span>
                        <button
                          type="button"
                          onClick={() => setEditSelectedCategoryIds([])}
                          className="text-gray-500 font-bold hover:underline"
                        >
                          ক্লিয়ার
                        </button>
                      </div>
                    </div>

                    <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
                      {incomeCategories.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-[11px] font-bold text-green-700 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            আয় / Income Categories ({incomeCategories.length})
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {incomeCategories.map((cat) => {
                              const isChecked =
                                editSelectedCategoryIds.includes(cat.id);
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => toggleCategory(cat.id, true)}
                                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition-all ${
                                    isChecked
                                      ? "border-green-600 bg-green-100 text-green-800 shadow-2xs font-semibold"
                                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                  }`}
                                >
                                  <div
                                    className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                                      isChecked
                                        ? "border-green-600 bg-green-600 text-white"
                                        : "border-gray-300 bg-white"
                                    }`}
                                  >
                                    {isChecked && (
                                      <FaCheck className="h-2 w-2" />
                                    )}
                                  </div>
                                  <span>{cat.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {expenseCategories.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-[11px] font-bold text-red-700 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            ব্যয় / Expense Categories ({expenseCategories.length})
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {expenseCategories.map((cat) => {
                              const isChecked =
                                editSelectedCategoryIds.includes(cat.id);
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => toggleCategory(cat.id, true)}
                                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition-all ${
                                    isChecked
                                      ? "border-red-600 bg-red-100 text-red-800 shadow-2xs font-semibold"
                                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                  }`}
                                >
                                  <div
                                    className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                                      isChecked
                                        ? "border-red-600 bg-red-600 text-white"
                                        : "border-gray-300 bg-white"
                                    }`}
                                  >
                                    {isChecked && (
                                      <FaCheck className="h-2 w-2" />
                                    )}
                                  </div>
                                  <span>{cat.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {editCategoryMode === "SPECIFIC" &&
                      editSelectedCategoryIds.length === 0 && (
                        <p className="text-[11px] text-amber-600 font-medium">
                          ⚠️ নির্দিষ্ট ক্যাটাগরি মোডে অন্তত ১টি ক্যাটাগরি নির্বাচন করুন অথবা "সকল ক্যাটাগরি" নির্বাচন করুন।
                        </p>
                      )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 px-5 py-3">
                <button
                  type="button"
                  onClick={() => setEditingModerator(null)}
                  disabled={isUpdating}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isUpdating ||
                    (editCategoryMode === "SPECIFIC" &&
                      editSelectedCategoryIds.length === 0)
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-purple-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                >
                  {isUpdating ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <FaCheck className="h-3.5 w-3.5" />
                      Save Permissions
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBranchModeratorsModal;
