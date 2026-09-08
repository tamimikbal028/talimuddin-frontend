import { Routes, Route, Link, useParams, Navigate } from "react-router-dom";
import branchHooks from "@/hooks/useBranch";
import BranchHeader from "./BranchHeader";
import BranchDetailsNavBar from "./BranchDetailsNavBar";
import BranchMembersTab from "./members/BranchMembersTab";
import BranchFinanceTab from "./finance/BranchFinanceTab";
import BranchDetailsSkeleton from "@/app/shared/LoadingSkeleton/BranchDetailsSkeleton";
import { FaCodeBranch, FaBan } from "react-icons/fa";

const BranchDetails = () => {
  const { branchId } = useParams();
  const { data: response, isLoading, error } = branchHooks.useBranchDetails();

  const branch = response?.data.branch;
  const meta = response?.data.meta;

  // Loading State
  if (isLoading) {
    return <BranchDetailsSkeleton />;
  }

  // Error State or Not Found
  if (error || !branch || !meta) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-xl border-2 border-gray-200 bg-gray-50 p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <FaCodeBranch className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          <div className="mb-3 inline-block rounded-full bg-red-100 px-3 py-1">
            <span className="text-xs font-semibold text-red-700">
              ERROR: Server Failed or Branch Not Found
            </span>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            Branch Not Available
          </h2>
          <p className="mb-6 text-gray-600">
            This branch could not be found or the server encountered an error.
            Please try again later.
          </p>
          <Link
            to="/branch"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <FaCodeBranch className="h-4 w-4" />
            Back to Branches
          </Link>
        </div>
      </div>
    );
  }

  // Branch Deleted
  if (branch.is_deleted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-xl border-2 border-red-200 bg-red-50 p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <FaBan className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="mb-3 inline-block rounded-full bg-red-100 px-3 py-1">
            <span className="text-xs font-semibold text-red-700">
              REASON: Branch Deleted
            </span>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            Branch Deleted
          </h2>
          <p className="mb-6 text-gray-600">
            This branch has been deleted and is no longer available.
          </p>
          <Link
            to="/branch"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <FaCodeBranch className="h-4 w-4" />
            Back to Branches
          </Link>
        </div>
      </div>
    );
  }

  const isMember =
    meta?.is_member ||
    meta?.is_admin_user ||
    meta?.is_admin ||
    meta?.is_moderator;
  const isManagement =
    meta?.is_admin || meta?.is_admin_user || meta?.is_moderator;

  // Show full branch details
  return (
    <div className="space-y-3">
      <BranchHeader branch={branch} meta={meta} />

      {/* Members & Admins View */}
      {isMember ? (
        <>
          {/* Navigation Tabs (Separated from Branch Header) */}
          <div className="border-y border-gray-200 bg-white shadow-2xs">
            <BranchDetailsNavBar
              meta={meta}
              membersCount={branch.members_count}
            />
          </div>

          <div className="mx-auto max-w-5xl">
            <div className="space-y-3">
              <Routes>
                <Route
                  index
                  element={
                    isManagement ? (
                      <Navigate to="finance" replace />
                    ) : (
                      <Navigate to="members" replace />
                    )
                  }
                />
                <Route path="members" element={<BranchMembersTab />} />
                {isManagement && (
                  <Route path="finance/*" element={<BranchFinanceTab />} />
                )}
                <Route
                  path="*"
                  element={
                    <Navigate
                      to={`/branch/branches/${branchId}/${
                        isManagement ? "finance" : "members"
                      }`}
                      replace
                    />
                  }
                />
              </Routes>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default BranchDetails;
