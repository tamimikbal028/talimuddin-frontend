import BranchCard from "@/app/branch/BranchCard";
import BranchCardSkeleton from "@/app/shared/LoadingSkeleton/BranchCardSkeleton";
import ErrorState from "@/app/shared/Error/ErrorState";
import EmptyState from "@/app/shared/EmptyState";
import branchHooks from "@/hooks/useBranch";
import authHooks from "@/hooks/useAuth";
import LoadMoreButton from "@/app/shared/Button/LoadMoreButton";
import { USER_TYPES } from "@/constants/user";
import { BRANCH_LIMIT } from "@/constants";
import type { BranchListItem } from "@/types";
import { FaCodeBranch } from "react-icons/fa";

const Branches = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = branchHooks.useMyBranches();
  const { user } = authHooks.useUser();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-7 w-32 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
          {[...Array(BRANCH_LIMIT)].map((_, i) => (
            <BranchCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <ErrorState message={error?.message || "Failed to load branches"} />;
  }

  const branches: BranchListItem[] = data.pages.flatMap((page) => page.data.branches);
  const totalDocs = data.pages[0].data.pagination.totalDocs || 0;

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          Branches {totalDocs ? `(${totalDocs})` : ""}
        </h2>
      </div>

      {/* no branches message */}
      {branches.length === 0 ? (
        <EmptyState
          icon={<FaCodeBranch />}
          title={
            user?.user_type === USER_TYPES.ADMIN
              ? "Create or join a branch to get started"
              : "Join a branch to get started"
          }
          description={
            user?.user_type === USER_TYPES.ADMIN
              ? "You can create a branch using the create branch button or join a branch using the join code"
              : "You can join a branch using the join code"
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
            {branches.map((b) => (
              <BranchCard key={b.id} branch={b} />
            ))}
            {/* Loading Skeleton for Next Page inside the same grid */}
            {isFetchingNextPage &&
              [...Array(BRANCH_LIMIT)].map((_, i) => (
                <BranchCardSkeleton key={`skeleton-${i}`} />
              ))}
          </div>

          {/* Load More Button */}
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <LoadMoreButton
                onClick={() => fetchNextPage()}
                isLoading={isFetchingNextPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Branches;
