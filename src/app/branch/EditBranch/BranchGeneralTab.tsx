import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Branch } from "@/types/branch.types";
import branchHooks from "@/hooks/useBranch";

interface BranchGeneralTabProps {
  branch: Branch;
}

const BranchGeneralTab = ({ branch }: BranchGeneralTabProps) => {
  const navigate = useNavigate();
  const { branchId } = useParams();
  const [formData, setFormData] = useState({
    name: branch.name,
    description: branch.description || "",
    location_name: branch.location_name || "",
    location_url: branch.location_url || "",
  });

  const { mutate: updateDetails, isPending } =
    branchHooks.useUpdateBranchDetails();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDetails(
      {
        updated_data: {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          location_name: formData.location_name.trim() || null,
          location_url: formData.location_url.trim() || null,
        },
      },
      {
        onSuccess: () => {
          navigate(`/branch/branches/${branchId}`);
        },
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-in fade-in slide-in-from-bottom-2 duration-500"
    >
      <div className="space-y-5 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-xl font-bold text-gray-900">General Information</h2>

        <div className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700"
            >
              Branch Name
            </label>
            <input
              type="text"
              id="name"
              maxLength={50}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Dhaka Campus Branch"
              className="mt-1.5 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-700"
            >
              About the Branch
            </label>
            <textarea
              id="description"
              rows={5}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Tell others what this branch is about..."
              className="mt-1.5 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="location_name"
                className="block text-sm font-semibold text-gray-700"
              >
                Location Name
              </label>
              <input
                type="text"
                id="location_name"
                maxLength={100}
                value={formData.location_name}
                onChange={(e) =>
                  setFormData({ ...formData, location_name: e.target.value })
                }
                placeholder="e.g., Mirpur 10, Dhaka"
                className="mt-1.5 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="location_url"
                className="block text-sm font-semibold text-gray-700"
              >
                Location Map URL
              </label>
              <input
                type="url"
                id="location_url"
                value={formData.location_url}
                onChange={(e) =>
                  setFormData({ ...formData, location_url: e.target.value })
                }
                placeholder="e.g., Google Maps URL"
                className="mt-1.5 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={
              isPending ||
              (formData.name.trim() === branch.name &&
                (formData.description.trim() || null) ===
                  (branch.description?.trim() || null) &&
                (formData.location_name.trim() || null) ===
                  (branch.location_name?.trim() || null) &&
                (formData.location_url.trim() || null) ===
                  (branch.location_url?.trim() || null))
            }
            className="flex min-w-35 items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-blue-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              "Update Details"
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default BranchGeneralTab;
