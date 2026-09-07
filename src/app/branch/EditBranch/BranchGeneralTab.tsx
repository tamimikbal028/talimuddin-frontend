import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaPlus, FaTrash } from "react-icons/fa";
import type { Branch, BranchAdminInfo } from "@/types/branch.types";
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

  const [adminList, setAdminList] = useState<BranchAdminInfo[]>(
    branch.admin_info && branch.admin_info.length > 0
      ? branch.admin_info.map((a) => ({
          name: a.name || "",
          number: a.number || "",
        }))
      : []
  );

  const { mutate: updateDetails, isPending } =
    branchHooks.useUpdateBranchDetails();

  const handleAddAdmin = () => {
    setAdminList([...adminList, { name: "", number: "" }]);
  };

  const handleRemoveAdmin = (index: number) => {
    setAdminList(adminList.filter((_, i) => i !== index));
  };

  const handleAdminChange = (
    index: number,
    field: "name" | "number",
    value: string
  ) => {
    const updated = [...adminList];
    updated[index] = { ...updated[index], [field]: value };
    setAdminList(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const filteredAdmins = adminList
      .map((a) => ({ name: a.name.trim(), number: a.number.trim() }))
      .filter((a) => a.name.length > 0 && a.number.length > 0);

    updateDetails(
      {
        updated_data: {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          location_name: formData.location_name.trim() || null,
          location_url: formData.location_url.trim() || null,
          admin_info: filteredAdmins,
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

          {/* Admin Info Section */}
          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-gray-900 sm:text-base">
                  Branch Admins
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  Admin names &amp; contact numbers
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddAdmin}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold whitespace-nowrap text-blue-700 shadow-2xs transition hover:bg-blue-100 active:scale-95 sm:px-3.5"
              >
                <FaPlus className="h-3 w-3 shrink-0" />
                <span>Add Admin</span>
              </button>
            </div>

            {adminList.length === 0 ? (
              <div className="mt-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/40 p-4 text-center">
                <p className="text-xs text-gray-500">
                  No admin contact added yet. Click &quot;Add Admin&quot; to add
                  one.
                </p>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {adminList.map((admin, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl border border-gray-200 bg-gray-50/70 p-3.5 transition-all sm:p-4"
                  >
                    {/* Top bar on mobile: badge & remove button */}
                    <div className="mb-2.5 flex items-center justify-between sm:hidden">
                      <span className="inline-flex items-center rounded-md bg-gray-200/70 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                        Admin #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAdmin(idx)}
                        title="Remove admin"
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100 active:scale-95"
                      >
                        <FaTrash className="h-3 w-3" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 sm:pr-12">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700">
                          Admin Name
                        </label>
                        <input
                          type="text"
                          value={admin.name}
                          onChange={(e) =>
                            handleAdminChange(idx, "name", e.target.value)
                          }
                          placeholder="e.g. Maulana Karim"
                          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs text-gray-900 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700">
                          Phone / Contact Number
                        </label>
                        <input
                          type="tel"
                          value={admin.number}
                          onChange={(e) =>
                            handleAdminChange(idx, "number", e.target.value)
                          }
                          placeholder="e.g. 017XXXXXXXX"
                          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs text-gray-900 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:text-sm"
                          required
                        />
                      </div>
                    </div>

                    {/* Desktop delete button positioned on the right */}
                    <div className="hidden sm:absolute sm:top-1/2 sm:right-3.5 sm:flex sm:-translate-y-1/2">
                      <button
                        type="button"
                        onClick={() => handleRemoveAdmin(idx)}
                        title="Remove admin"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 hover:text-red-700 active:scale-95"
                      >
                        <FaTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending || !formData.name.trim()}
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
