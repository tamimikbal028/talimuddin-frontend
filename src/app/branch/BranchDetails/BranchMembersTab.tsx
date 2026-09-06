import { HiExclamationTriangle, HiUsers } from "react-icons/hi2";
import BranchMemberCard from "@/app/branch/BranchDetails/BranchMemberCard";
import FriendCardSkeleton from "@/app/shared/LoadingSkeleton/FriendCardSkeleton";
import branchHooks from "@/hooks/useBranch";
import LoadMoreButton from "@/app/shared/Button/LoadMoreButton";

const BranchMembersTab = () => {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = branchHooks.useBranchMembers();

  const members = data?.pages.flatMap((page) => page.data.members) || [];
  const isCreator = data?.pages[0]?.data.meta?.is_creator ?? false;
  const totalDocs =
    data?.pages[0]?.data.pagination?.totalDocs || members.length;

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-lg bg-white p-4">
        <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200"></div>
        {[...Array(5)].map((_, i) => (
          <FriendCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <HiExclamationTriangle className="h-6 w-6 text-red-600" />
        </div>
        <p className="font-semibold text-red-800">Failed to load members</p>
        <p className="mt-1 text-sm text-red-600">
          Please try refreshing the page
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">
        Members ({totalDocs})
      </h2>

      {members.length > 0 ? (
        <div className="space-y-3">
          {members.map((member) => (
            <BranchMemberCard
              key={member.meta.member_id}
              member={member}
              isCreator={isCreator}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <HiUsers className="mx-auto mb-3 h-12 w-12 text-gray-400" />
          <p className="text-gray-500">No members found in this branch</p>
        </div>
      )}

      {hasNextPage && (
        <div className="mt-4">
          <LoadMoreButton
            onClick={() => fetchNextPage()}
            isLoading={isFetchingNextPage}
            label="Load More Members"
            loadingLabel="Loading more members..."
          />
        </div>
      )}
    </div>
  );
};

export default BranchMembersTab;
