import { useState, useEffect } from "react";
import {
  FaTimes,
  FaUserShield,
  FaTrash,
  FaUserPlus,
  FaSearch,
  FaUser,
  FaCheck,
  FaListUl,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import branchHooks from "@/hooks/useBranch";
import confirm from "@/utils/sweetAlert";
import type { BranchAdminItem, SearchUserItem } from "@/types";

interface ManageBranchAdminsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchName: string;
}

const ManageBranchAdminsModal = ({
  isOpen,
  onClose,
  branchName,
}: ManageBranchAdminsModalProps) => {
  const [activeTab, setActiveTab] = useState<"list" | "add">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<SearchUserItem | null>(null);

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
    }
  }, [isOpen]);

  // Query admins
  const { data: adminsData, isLoading: isLoadingAdmins } =
    branchHooks.useBranchAdmins();
  const { mutate: removeAdmin, isPending: isRemoving } =
    branchHooks.useRemoveBranchAdmin();

  // Query searchable users when in "add" tab
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = branchHooks.useSearchUsers(
    debouncedSearch,
    isOpen && activeTab === "add"
  );
  const users = usersData?.pages.flatMap((page) => page.data.users) || [];
  const totalUsers = usersData?.pages[0]?.data.pagination?.totalDocs;

  // Mutation to add branch admin
  const { mutate: addAdmin, isPending: isAdding } =
    branchHooks.useAddBranchAdmin();

  if (!isOpen) return null;

  const admins: BranchAdminItem[] = adminsData?.data?.admins || [];

  const handleRemove = async (admin: BranchAdminItem) => {
    const adminName = admin.user?.full_name || admin.user?.user_name || "Admin";
    const ok = await confirm({
      title: "Remove Branch Admin?",
      text: `Are you sure you want to remove ${adminName} from being an admin of this branch?`,
      confirmButtonText: "Yes, remove",
      confirmButtonColor: "#dc2626",
      isDanger: true,
      icon: "warning",
    });

    if (ok) {
      removeAdmin(admin.id);
    }
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || isAdding) return;

    addAdmin(
      { user_id: selectedUser.id },
      {
        onSuccess: () => {
          setSelectedUser(null);
          setSearchTerm("");
          setActiveTab("list");
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
        onClick={isAdding || isRemoving ? undefined : onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-2xs">
              <FaUserShield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 sm:text-lg">
                Manage Branch Admins
              </h2>
              <p className="text-xs text-gray-500">
                {branchName} • {admins.length} Assigned
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isAdding || isRemoving}
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
                ? "bg-white text-blue-600 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FaListUl className="h-3.5 w-3.5" />
            <span>Current Admins ({admins.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("add")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${
              activeTab === "add"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FaUserPlus className="h-3.5 w-3.5" />
            <span>Add Admin</span>
          </button>
        </div>

        {/* Tab 1: Current Admins List */}
        {activeTab === "list" && (
          <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
            {isLoadingAdmins ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <p className="mt-2 text-xs font-medium">
                  Loading branch admins...
                </p>
              </div>
            ) : admins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
                <FaUserShield className="mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm font-semibold text-gray-700">
                  No Branch Admins Found
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  Click "+ Add Admin" to assign an administrator to this branch.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("add")}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-blue-700"
                >
                  <FaUserPlus className="h-3.5 w-3.5" />
                  <span>Add Admin Now</span>
                </button>
              </div>
            ) : (
              admins.map((admin) => {
                const u = admin.user;
                const name = u?.full_name || u?.user_name || "Admin";

                return (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-200/90 bg-white p-3 shadow-2xs transition-colors hover:border-gray-300"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {u?.avatar ? (
                        <img
                          src={u.avatar}
                          alt={name}
                          className="h-10 w-10 shrink-0 rounded-full object-cover shadow-2xs"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 shadow-2xs">
                          {name.charAt(0).toUpperCase() || "A"}
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

                    <button
                      type="button"
                      onClick={() => handleRemove(admin)}
                      disabled={isRemoving}
                      title="Remove this branch admin"
                      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/80 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:border-red-300 hover:bg-red-100 active:scale-95 disabled:opacity-50"
                    >
                      <FaTrash className="h-3 w-3" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Add New Admin */}
        {activeTab === "add" && (
          <form
            onSubmit={handleAddAdmin}
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
                    className="w-full rounded-xl border border-gray-300 py-2.5 pr-4 pl-9 text-xs text-gray-900 shadow-2xs transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-sm"
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
                  Search active platform users to appoint as Branch Admin
                </p>
              </div>

              {/* Users List Box */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Select User{" "}
                  {selectedUser && (
                    <span className="font-medium text-blue-600">
                      (1 selected: {selectedUser.full_name})
                    </span>
                  )}
                </label>

                <div className="max-h-56 min-h-36 space-y-1.5 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50/50 p-2">
                  {isLoadingUsers ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
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
                    <>
                      {users.map((u) => {
                        const isAlreadyAdmin = !!u.branch_role?.is_admin;
                        const isAlreadyModerator =
                          !!u.branch_role?.is_moderator;
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
                                  ? "cursor-pointer border-blue-500 bg-blue-50/90 shadow-2xs ring-1 ring-blue-500"
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
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 shadow-2xs">
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
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xs">
                                  <FaCheck className="h-2.5 w-2.5" />
                                </div>
                              ) : (
                                <div className="h-5 w-5 rounded-full border border-gray-300 bg-white" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {hasNextPage && (
                        <div className="pt-1.5 pb-0.5">
                          <button
                            type="button"
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50/90 py-2 text-xs font-semibold text-blue-700 shadow-2xs transition-all hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isFetchingNextPage ? (
                              <>
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                <span>আরও ইউজার লোড হচ্ছে...</span>
                              </>
                            ) : (
                              <span>
                                আরও লোড করুন (Load More)
                                {totalUsers
                                  ? ` • (${users.length} of ${totalUsers})`
                                  : ""}
                              </span>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
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
                disabled={!selectedUser || isAdding}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
              >
                {isAdding ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Adding Admin...
                  </>
                ) : (
                  <>
                    <FaUserShield className="h-3.5 w-3.5" />
                    Add as Admin
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
    </div>
  );
};

export default ManageBranchAdminsModal;
