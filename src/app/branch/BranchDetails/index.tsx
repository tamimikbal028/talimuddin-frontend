import { Routes, Route, Link, useParams, Navigate } from "react-router-dom";
import branchHooks from "@/hooks/useBranch";
import BranchHeader from "./BranchHeader";
import BranchMembersTab from "./BranchMembersTab";
import BranchAbout from "./BranchAbout";
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
  if (error || !branch) {
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
              REASON: Branch Deleted by Creator
            </span>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">Branch Deleted</h2>
          <p className="mb-6 text-gray-600">
            This branch has been deleted by the creator and is no longer
            available.
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

  // Not a Member
  if (!meta?.is_member) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-xl border-2 border-blue-200 bg-blue-50 p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <FaCodeBranch className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">Not a Member</h2>
          <p className="mb-6 text-gray-600">
            You are not a member of this branch. Please join using the join code.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/branch/joinbranch"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Join with Code
            </Link>
            <Link
              to="/branch"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-700"
            >
              <FaCodeBranch className="h-4 w-4" />
              Back to Branches
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Member - Show full branch details
  return (
    <div className="space-y-5 overflow-hidden">
      <BranchHeader branch={branch} meta={meta} />

      <div className="mx-auto max-w-5xl">
        <div className="space-y-3 rounded-xl shadow">
          <Routes>
            <Route
              index
              element={
                meta?.is_creator || meta?.is_admin ? (
                  <Navigate to="finance" replace />
                ) : (
                  <Navigate to="members" replace />
                )
              }
            />
            <Route path="members" element={<BranchMembersTab />} />
            <Route path="about" element={<BranchAbout branch={branch} />} />
            {(meta?.is_creator || meta?.is_admin) && (
              <Route path="finance/*" element={<BranchFinanceTab />} />
            )}
            <Route
              path="*"
              element={<Navigate to={`/branch/branches/${branchId}`} replace />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default BranchDetails;
