import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { FaUserShield, FaSearch, FaUser, FaCheck } from "react-icons/fa";
import branchHooks from "@/hooks/useBranch";
import type { SearchUserItem } from "@/types";

interface AddBranchAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchName: string;
}

const AddBranchAdminModal = ({
  isOpen,
  onClose,
  branchName,
}: AddBranchAdminModalProps) => {
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
      setSearchTerm("");
      setDebouncedSearch("");
      setSelectedUser(null);
    }
  }, [isOpen]);

  // Query users
  const { data, isLoading } = branchHooks.useSearchUsers(
    debouncedSearch,
    isOpen
  );
  const users = data?.data.users || [];

  // Mutation to add branch admin
  const { mutate: addAdmin, isPending } = branchHooks.useAddBranchAdmin();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || isPending) return;

    addAdmin(
      { user_id: selectedUser.id },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="animate-in fade-in fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={isPending ? undefined : onClose}
      />

      {/* Modal Container */}
      <div className="animate-in zoom-in-95 relative w-full max-w-lg overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl transition-all duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FaUserShield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                Add Branch Admin
              </h3>
              <p className="line-clamp-1 text-xs text-gray-500">
                Appoint an administrator for {branchName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
            title="Close modal"
          >
            <IoClose className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6">
          <div className="space-y-4">
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
                  placeholder="Search by full name, username, or email..."
                  autoFocus
                  disabled={isPending}
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
                Type at least 2 characters to search active users across the
                platform
              </p>
            </div>

            {/* Users List Box */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">
                Select User{" "}
                {selectedUser && (
                  <span className="font-medium text-blue-600">
                    (1 selected)
                  </span>
                )}
              </label>

              <div className="max-h-56 min-h-35 space-y-1.5 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50/50 p-2">
                {isLoading ? (
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
                        : "No users found"}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Try searching with a different name, username, or email
                    </p>
                  </div>
                ) : (
                  users.map((u) => {
                    const isAlreadyAdmin = !!u.branch_role?.is_admin;
                    const isAlreadyModerator = !!u.branch_role?.is_moderator;
                    const isAppAdmin = !!u.is_app_admin || u.user_type === "ADMIN";
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
                  })

                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedUser || isPending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
            >
              {isPending ? (
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
      </div>
    </div>
  );
};

export default AddBranchAdminModal;
