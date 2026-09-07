import { useState, useEffect } from "react";
import BranchCard from "@/app/branch/BranchCard";
import BranchCardSkeleton from "@/app/shared/LoadingSkeleton/BranchCardSkeleton";
import ErrorState from "@/app/shared/Error/ErrorState";
import EmptyState from "@/app/shared/EmptyState";
import branchHooks from "@/hooks/useBranch";
import authHooks from "@/hooks/useAuth";
import LoadMoreButton from "@/app/shared/Button/LoadMoreButton";
import { BRANCH_LIMIT } from "@/constants";
import type { BranchListItem } from "@/types";
import {
  FaCodeBranch,
  FaSearch,
  FaTimes,
  FaBuilding,
  FaUserCheck,
} from "react-icons/fa";

const Branches = () => {
  const { isAuthenticated } = authHooks.useUser();
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

  // My Branches Query (only enabled if authenticated)
  const {
    data: myBranchesData,
    fetchNextPage: fetchNextMyBranches,
    hasNextPage: hasNextMyBranches,
    isFetchingNextPage: isFetchingNextMyBranches,
  } = branchHooks.useMyBranches(isAuthenticated);

  // All Branches Query
  const {
    data: allBranchesData,
    fetchNextPage: fetchNextAllBranches,
    hasNextPage: hasNextAllBranches,
    isFetchingNextPage: isFetchingNextAllBranches,
    isLoading: isAllBranchesLoading,
    error: allBranchesError,
  } = branchHooks.useAllBranches();

  const isSearching = debouncedTerm.length > 0;

  // Directory Search Query
  const {
    data: searchData,
    isLoading: isSearchLoading,
    error: searchError,
  } = branchHooks.useBranchDirectorySearch(debouncedTerm);

  const myBranches: BranchListItem[] =
    myBranchesData?.pages.flatMap((page) => page.data.branches) || [];
  const myTotalDocs =
    myBranchesData?.pages[0]?.data?.pagination?.totalDocs || 0;

  const allBranches: BranchListItem[] =
    allBranchesData?.pages.flatMap((page) => page.data.branches) || [];
  const allTotalDocs =
    allBranchesData?.pages[0]?.data?.pagination?.totalDocs || 0;

  const searchResults: BranchListItem[] = searchData?.data?.branches || [];

  return (
    <div className="space-y-5 pb-8">
      {/* Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <FaSearch className="pointer-events-none absolute left-3.5 h-4 w-4 text-gray-400 sm:left-4" />
          <input
            type="text"
            placeholder="Search branches by name across the platform..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-10 pl-10 text-sm text-gray-900 shadow-xs outline-hidden transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:py-3 sm:pr-12 sm:pl-11 sm:text-base"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:right-4"
              aria-label="Clear search"
            >
              <FaTimes className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {isSearching ? (
        // Search Results View
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
            <div className="flex items-center gap-2">
              <FaSearch className="h-4 w-4 text-blue-600" />
              <h2 className="text-base font-bold text-gray-900 sm:text-lg">
                Search Results{" "}
                {searchResults ? `(${searchResults.length})` : ""}
              </h2>
            </div>
          </div>

          {isSearchLoading ? (
            <div className="xs:grid-cols-2 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
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
            <div className="xs:grid-cols-2 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
              {searchResults.map((b) => (
                <BranchCard key={b.id} branch={b} />
              ))}
            </div>
          )}
        </div>
      ) : (
        // Normal View: Section 1 (My Branches) + Section 2 (All Branches)
        <div className="space-y-8">
          {/* SECTION 1: MY BRANCHES (Only shown if user has joined at least one branch) */}
          {myBranches.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FaUserCheck className="h-3.5 w-3.5" />
                  </div>
                  <h2 className="text-base font-bold text-gray-900 sm:text-lg">
                    My Branches{" "}
                    {myTotalDocs
                      ? `(${myTotalDocs})`
                      : `(${myBranches.length})`}
                  </h2>
                </div>
                <span className="text-xs font-medium text-gray-400">
                  Branches where you are a member / admin
                </span>
              </div>

              <div className="xs:grid-cols-2 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
                {myBranches.map((b) => (
                  <BranchCard key={b.id} branch={b} />
                ))}
                {isFetchingNextMyBranches &&
                  [...Array(3)].map((_, i) => (
                    <BranchCardSkeleton key={`my-skel-${i}`} />
                  ))}
              </div>

              {hasNextMyBranches && (
                <div className="flex justify-center pt-2">
                  <LoadMoreButton
                    onClick={() => fetchNextMyBranches()}
                    isLoading={isFetchingNextMyBranches}
                  />
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: ALL BRANCHES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <FaBuilding className="h-3.5 w-3.5" />
                </div>
                <h2 className="text-base font-bold text-gray-900 sm:text-lg">
                  All Branches{" "}
                  {allTotalDocs
                    ? `(${allTotalDocs})`
                    : allBranches.length
                      ? `(${allBranches.length})`
                      : ""}
                </h2>
              </div>
              <span className="text-xs font-medium text-gray-400">
                All branches across the platform
              </span>
            </div>

            {isAllBranchesLoading ? (
              <div className="xs:grid-cols-2 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
                {[...Array(BRANCH_LIMIT)].map((_, i) => (
                  <BranchCardSkeleton key={i} />
                ))}
              </div>
            ) : allBranchesError ? (
              <ErrorState
                message={
                  allBranchesError instanceof Error
                    ? allBranchesError.message
                    : "Failed to load branches"
                }
              />
            ) : allBranches.length === 0 ? (
              <EmptyState
                icon={<FaCodeBranch className="text-gray-400" />}
                title="No branches available"
                description="No branches have been created on the platform yet."
              />
            ) : (
              <>
                <div className="xs:grid-cols-2 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
                  {allBranches.map((b) => (
                    <BranchCard key={b.id} branch={b} />
                  ))}
                  {isFetchingNextAllBranches &&
                    [...Array(3)].map((_, i) => (
                      <BranchCardSkeleton key={`all-skel-${i}`} />
                    ))}
                </div>

                {hasNextAllBranches && (
                  <div className="flex justify-center pt-2">
                    <LoadMoreButton
                      onClick={() => fetchNextAllBranches()}
                      isLoading={isFetchingNextAllBranches}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
