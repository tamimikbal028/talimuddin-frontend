import { useState } from "react";
import {
  HiExclamationTriangle,
  HiUsers,
  HiMagnifyingGlass,
} from "react-icons/hi2";
import { FaUserPlus } from "react-icons/fa";
import BranchMemberCard from "@/app/branch/BranchDetails/BranchMemberCard";
import AddEditMemberModal from "@/app/branch/BranchDetails/AddEditMemberModal";
import FriendCardSkeleton from "@/app/shared/LoadingSkeleton/FriendCardSkeleton";
import branchHooks from "@/hooks/useBranch";
import LoadMoreButton from "@/app/shared/Button/LoadMoreButton";
import type { BranchMember } from "@/types";

const BranchMembersTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<BranchMember | null>(null);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = branchHooks.useBranchMembers(searchTerm);

  const members = (data?.pages.flatMap((page) => page.data.members) || [])
    .filter((member) => !member.meta?.is_admin && !member.meta?.is_creator)
    .sort((a, b) => {
      const aSerial = a.serial_no;
      const bSerial = b.serial_no;
      if (aSerial != null && bSerial != null) {
        return aSerial - bSerial;
      }
      if (aSerial != null) return -1;
      if (bSerial != null) return 1;
      return 0;
    });
  const isCreator = data?.pages[0]?.data.meta?.is_creator ?? false;
  const isAdmin = data?.pages[0]?.data.meta?.is_admin ?? false;
  const canAddMember = isCreator || isAdmin;

  const totalDocs =
    data?.pages[0]?.data.pagination?.totalDocs || members.length;

  const handleOpenAddModal = () => {
    setMemberToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: BranchMember) => {
    setMemberToEdit(member);
    setIsModalOpen(true);
  };

  if (isLoading && !searchTerm) {
    return (
      <div className="space-y-3 rounded-2xl bg-white p-5 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse rounded-lg bg-gray-200"></div>
          <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-200"></div>
        </div>
        {[...Array(5)].map((_, i) => (
          <FriendCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <HiExclamationTriangle className="h-6 w-6 text-red-600" />
        </div>
        <p className="font-semibold text-red-800">Failed to load students</p>
        <p className="mt-1 text-sm text-red-600">
          Please try refreshing the page
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 sm:gap-2.5">
            <h2 className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
              Students
            </h2>
            <span className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 sm:px-2.5">
              {totalDocs}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            List of students in this branch
          </p>
        </div>

        {canAddMember && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 active:scale-98 sm:gap-2 sm:px-4 sm:py-2.5"
          >
            <FaUserPlus className="h-3.5 w-3.5" />
            <span>Add Student</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <HiMagnifyingGlass className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search students by name, phone or serial..."
          className="w-full rounded-xl border border-gray-500 bg-white py-2.5 pr-10 pl-10 text-xs text-gray-800 shadow-xs transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-none sm:text-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-xs font-medium text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Members List */}
      {members.length > 0 ? (
        <div className="space-y-3">
          {members.map((member) => (
            <BranchMemberCard
              key={member.meta.member_id}
              member={member}
              onEdit={canAddMember ? handleOpenEditModal : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
          <HiUsers className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="font-medium text-gray-700">
            {searchTerm
              ? "No matching students found"
              : "No students found in this branch"}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {searchTerm
              ? "Try searching with a different name or phone number"
              : canAddMember
                ? "Click 'Add Student' above to enter students to this branch"
                : "No students have joined this branch yet"}
          </p>
        </div>
      )}

      {/* Load more */}
      {hasNextPage && (
        <div className="mt-4">
          <LoadMoreButton
            onClick={() => fetchNextPage()}
            isLoading={isFetchingNextPage}
            label="Load More Students"
            loadingLabel="Loading more students..."
          />
        </div>
      )}

      {/* Add / Edit Member Modal */}
      <AddEditMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        memberToEdit={memberToEdit}
      />
    </div>
  );
};

export default BranchMembersTab;
