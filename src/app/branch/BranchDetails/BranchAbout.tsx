import {
  FaCalendarAlt,
  FaUsers,
  FaFileAlt,
  FaInfoCircle,
  FaChartBar,
  FaBuilding,
  FaSitemap,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import type { Branch } from "@/types/branch.types";

interface BranchAboutProps {
  branch: Branch;
}

const BranchAbout = ({ branch }: BranchAboutProps) => {
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <FaInfoCircle className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branch Details</h1>
          <p className="text-gray-500">Learn more about this Branch</p>
        </div>
      </div>

      {/* Description Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <FaFileAlt className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">About</h2>
        </div>
        <p className="leading-relaxed text-gray-700">
          {branch.description || "No description provided."}
        </p>
      </div>

      {/* Stats Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <FaChartBar className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Statistics</h2>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-4 rounded-lg bg-linear-to-r from-blue-50 to-blue-100 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
              <FaUsers className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {(branch.members_count || 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Hierarchy / Structure Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <FaInfoCircle className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Branch Structure
          </h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div>
              <p className="font-medium text-gray-900">Branch Type</p>
              <p className="text-sm text-gray-600">
                {branch.branch_type === "SUB"
                  ? "Sub Branch (অধিভুক্ত শাখা)"
                  : "Main Branch (মূল শাখা)"}
              </p>
              {branch.branch_type === "SUB" && branch.parent_branch && (
                <p className="mt-1 text-xs font-medium text-blue-600">
                  Parent Branch:{" "}
                  <Link
                    to={`/branch/branches/${branch.parent_branch.id}`}
                    className="underline hover:text-blue-800"
                  >
                    {branch.parent_branch.name}
                  </Link>
                </p>
              )}
            </div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                branch.branch_type === "SUB"
                  ? "bg-purple-100 text-purple-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              {branch.branch_type === "SUB" ? (
                <FaSitemap className="h-5 w-5" />
              ) : (
                <FaBuilding className="h-5 w-5" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* History Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <FaCalendarAlt className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">History</h2>
        </div>
        <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
            <FaCalendarAlt className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Branch Created</p>
            <p className="text-sm text-gray-600">
              {formatDate(branch.created_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchAbout;
