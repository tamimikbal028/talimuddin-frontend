import {
  FaUsers,
  FaBuilding,
  FaSitemap,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
  FaUserShield,
  FaPhoneAlt,
  FaUser,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import type { Branch } from "@/types/branch.types";

interface BranchAboutProps {
  branch: Branch;
}

const BranchAbout = ({ branch }: BranchAboutProps) => {
  return (
    <div className="w-full space-y-5 pb-6">
      {/* Hero Overview Card with Branch Name */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-linear-to-br from-blue-50/70 via-white to-indigo-50/50 p-5 shadow-xs sm:p-6">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
            <h1 className="text-center text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              {branch.name}
            </h1>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                branch.branch_type === "SUB"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {branch.branch_type === "SUB" ? "Sub Branch" : "Main Branch"}
            </span>
          </div>

          {branch.branch_type === "SUB" && branch.parent_branch?.name && (
            <p className="mt-1 text-xs font-medium text-gray-600 sm:text-sm">
              Parent Branch:{" "}
              <Link
                to={`/branch/branches/${branch.parent_branch.id}`}
                className="font-semibold text-blue-600 hover:text-blue-800"
              >
                {branch.parent_branch.name}
              </Link>
            </p>
          )}

          {branch.description ? (
            <p className="mt-3 text-xs leading-relaxed whitespace-pre-line text-gray-700 sm:text-sm">
              {branch.description}
            </p>
          ) : (
            <p className="mt-2 text-xs text-gray-400 italic sm:text-sm">
              No description provided for this branch yet.
            </p>
          )}
        </div>
      </div>

      {/* Stats Highlights Grid */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
        {/* Total Members */}
        <div className="flex items-center gap-3.5 rounded-xl border border-gray-200 bg-white p-4 shadow-2xs transition hover:shadow-xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FaUsers className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500">Total Students</p>
            <p className="text-lg font-bold text-gray-900 sm:text-xl">
              {(branch.members_count || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Structure */}
        <div className="flex items-center gap-3.5 rounded-xl border border-gray-200 bg-white p-4 shadow-2xs transition hover:shadow-xs">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              branch.branch_type === "SUB"
                ? "bg-purple-50 text-purple-600"
                : "bg-indigo-50 text-indigo-600"
            }`}
          >
            {branch.branch_type === "SUB" ? (
              <FaSitemap className="h-5 w-5" />
            ) : (
              <FaBuilding className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500">Branch Type</p>
            <p className="truncate text-base font-bold text-gray-900 sm:text-lg">
              {branch.branch_type === "SUB" ? "Sub Branch" : "Main Branch"}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Information Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Card 1: Branch Admins */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs">
          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <FaUserShield className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-gray-900">
                Branch Admins
              </h2>
            </div>
            {branch.admin_info && branch.admin_info.length > 0 && (
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                {branch.admin_info.length}{" "}
                {branch.admin_info.length === 1 ? "Admin" : "Admins"}
              </span>
            )}
          </div>

          {branch.admin_info && branch.admin_info.length > 0 ? (
            <div className="space-y-2.5">
              {branch.admin_info.map((admin, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/70 p-3 transition hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-blue-600 shadow-2xs">
                      <FaUser className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {admin.name}
                      </p>
                      <p className="text-xs text-gray-500">Administrator</p>
                    </div>
                  </div>
                  {admin.number && (
                    <a
                      href={`tel:${admin.number}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 text-xs font-medium text-blue-600 shadow-2xs transition hover:bg-blue-50 hover:text-blue-700 active:scale-95"
                      title={`Call ${admin.name}`}
                    >
                      <FaPhoneAlt className="h-2.5 w-2.5" />
                      <span>{admin.number}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center">
              <FaUserShield className="mx-auto h-6 w-6 text-gray-300" />
              <p className="mt-2 text-xs font-medium text-gray-500">
                No custom admin contacts added yet
              </p>
            </div>
          )}
        </div>

        {/* Card 2: Location & Address */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs">
          <div className="mb-4 flex items-center gap-2.5 border-b border-gray-100 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
              <FaMapMarkerAlt className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-gray-900">
              Location &amp; Address
            </h2>
          </div>

          {branch.location_name || branch.location_url ? (
            <div className="space-y-3">
              {branch.location_name && (
                <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-3.5">
                  <p className="text-xs font-medium text-gray-500">
                    Address / Place
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900">
                    {branch.location_name}
                  </p>
                </div>
              )}
              {branch.location_url && (
                <a
                  href={
                    branch.location_url.startsWith("http://") ||
                    branch.location_url.startsWith("https://")
                      ? branch.location_url
                      : `https://${branch.location_url}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 active:scale-95"
                >
                  <FaExternalLinkAlt className="h-3 w-3" />
                  <span>View on Google Maps</span>
                </a>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center">
              <FaMapMarkerAlt className="mx-auto h-6 w-6 text-gray-300" />
              <p className="mt-2 text-xs font-medium text-gray-500">
                No location details provided yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchAbout;
