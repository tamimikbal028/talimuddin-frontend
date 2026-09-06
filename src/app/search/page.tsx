import { useState, useEffect } from "react";
import { FaSearch, FaCodeBranch, FaTimes } from "react-icons/fa";
import BranchCard from "@/app/branch/BranchCard";
import BranchCardSkeleton from "@/app/shared/LoadingSkeleton/BranchCardSkeleton";
import ErrorState from "@/app/shared/Error/ErrorState";
import EmptyState from "@/app/shared/EmptyState";
import branchHooks from "@/hooks/useBranch";
import { BRANCH_LIMIT } from "@/constants";

const SearchBranches = () => {
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

  const { data, isLoading, error } =
    branchHooks.useBranchDirectorySearch(debouncedTerm);

  const branches = data?.data?.branches || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-md">
          <FaSearch className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            Search Branch
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Find and join public or private institution branches.
          </p>
        </div>
      </div>

      {/* Search Bar Container */}
      <div className="relative">
        <div className="relative flex items-center">
          <FaSearch className="absolute left-3.5 sm:left-4 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search branches by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl sm:rounded-2xl border border-gray-200 bg-white py-3 pr-10 sm:pr-12 pl-10 sm:pl-12 text-sm sm:text-base text-gray-900 shadow-xs outline-hidden transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3.5 sm:right-4 flex h-5 w-5 sm:h-6 sm:w-6 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
              aria-label="Clear search"
            >
              <FaTimes className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
            {[...Array(BRANCH_LIMIT)].map((_, i) => (
              <BranchCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            message={
              error instanceof Error ? error.message : "Failed to search branches"
            }
          />
        ) : branches.length === 0 ? (
          <EmptyState
            icon={<FaCodeBranch className="text-gray-400" />}
            title="No Branches Found"
            description={
              debouncedTerm
                ? `We couldn't find any active branches matching "${debouncedTerm}".`
                : "There are no branches available to display."
            }
          />
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {debouncedTerm
                ? `Search Results (${branches.length})`
                : `All Branches (${branches.length})`}
            </h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
              {branches.map((branch) => (
                <BranchCard key={branch.id} branch={branch} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBranches;
