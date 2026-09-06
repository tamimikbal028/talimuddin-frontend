import { useState, useEffect } from "react";
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
import { FaCodeBranch, FaSearch, FaTimes } from "react-icons/fa";

const Branches = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim());
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const handleClear = () => {
    setSearchTerm("");
    setDebouncedTerm("");
  };

  const {
    data: myBranchesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isMyBranchesLoading,
    error: myBranchesError,
  } = branchHooks.useMyBranches();

  const isSearching = debouncedTerm.length > 0;

  const {
    data: searchData,
    isLoading: isSearchLoading,
    error: searchError,
  } = branchHooks.useBranchDirectorySearch(debouncedTerm);

  const { user } = authHooks.useUser();

  const myBranches: BranchListItem[] =
    myBranchesData?.pages.flatMap((page) => page.data.branches) || [];
  const totalDocs =
    myBranchesData?.pages[0]?.data?.pagination?.totalDocs || 0;
  const searchResults: BranchListItem[] = searchData?.data?.branches || [];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <FaSearch className="absolute left-3.5 sm:left-4 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search branches by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 sm:py-3 pr-10 sm:pr-12 pl-10 sm:pl-11 text-sm sm:text-base text-gray-900 shadow-xs outline-hidden transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3.5 sm:right-4 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
              aria-label="Clear search"
            >
              <FaTimes className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Header with Title and Count */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          {isSearching
            ? `Search Results ${
                !isSearchLoading && searchResults ? `(${searchResults.length})` : ""
              }`
            : `Branches ${totalDocs ? `(${totalDocs})` : ""}`}
        </h2>
      </div>

      {/* Content Area */}
      {isSearching ? (
        // Search View
        isSearchLoading ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
            {[...Array(BRANCH_LIMIT)].map((_, i) => (
              <BranchCardSkeleton key={i} />
            ))}
          </div>
        ) : searchError ? (
          <ErrorState
            message={
              searchError instanceof Error
                ? searchError.message
                : "Failed to search branches"
            }
          />
        ) : searchResults.length === 0 ? (
          <EmptyState
            icon={<FaCodeBranch className="text-gray-400" />}
            title="No Branches Found"
            description={`We couldn't find any active branches matching "${debouncedTerm}".`}
          />
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
            {searchResults.map((b) => (
              <BranchCard key={b.id} branch={b} />
            ))}
          </div>
        )
      ) : (
        // My Branches View
        isMyBranchesLoading ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
            {[...Array(BRANCH_LIMIT)].map((_, i) => (
              <BranchCardSkeleton key={i} />
            ))}
          </div>
        ) : myBranchesError || !myBranchesData ? (
          <ErrorState
            message={
              myBranchesError instanceof Error
                ? myBranchesError.message
                : "Failed to load branches"
            }
          />
        ) : myBranches.length === 0 ? (
          <EmptyState
            icon={<FaCodeBranch className="text-gray-400" />}
            title={
              user?.user_type === USER_TYPES.ADMIN
                ? "Create a branch to get started"
                : "No branches available"
            }
            description={
              user?.user_type === USER_TYPES.ADMIN
                ? "You can create a branch using the create branch button."
                : "You are not associated with any branch yet."
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
              {myBranches.map((b) => (
                <BranchCard key={b.id} branch={b} />
              ))}
              {/* Loading Skeleton for Next Page */}
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
        )
      )}
    </div>
  );
};

export default Branches;
