import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { HiPencilSquare } from "react-icons/hi2";
import { FaUserPlus } from "react-icons/fa";
import type { BranchMember, AddBranchMemberData } from "@/types";
import branchHooks from "@/hooks/useBranch";
import { BLOOD_GROUPS } from "@/constants";

interface AddEditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: BranchMember | null;
}

const AddEditMemberModal = ({
  isOpen,
  onClose,
  memberToEdit,
}: AddEditMemberModalProps) => {
  const isEdit = !!memberToEdit;
  const { mutate: addMember, isPending: isAdding } =
    branchHooks.useAddBranchMember();
  const { mutate: updateMember, isPending: isUpdating } =
    branchHooks.useUpdateBranchMember();

  const isPending = isAdding || isUpdating;

  const [formData, setFormData] = useState<AddBranchMemberData>({
    serial_no: null,
    name: "",
    phone: "",
    address: "",
    blood_group: "",
    email: "",
    note: "",
  });

  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  useEffect(() => {
    if (memberToEdit) {
      setFormData({
        serial_no: memberToEdit.serial_no ?? null,
        name: memberToEdit.name || memberToEdit.user?.full_name || "",
        phone: memberToEdit.phone || "",
        address: memberToEdit.address || "",
        blood_group: memberToEdit.blood_group || "",
        email: memberToEdit.email || memberToEdit.user?.email || "",
        note: memberToEdit.note || "",
      });
    } else {
      setFormData({
        serial_no: null,
        name: "",
        phone: "",
        address: "",
        blood_group: "",
        email: "",
        note: "",
      });
    }
    setErrors({});
  }, [memberToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { name?: string; phone?: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = "Student name is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: AddBranchMemberData = {
      serial_no:
        formData.serial_no !== undefined && formData.serial_no !== null
          ? Number(formData.serial_no)
          : null,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      address: formData.address?.trim() || null,
      blood_group: formData.blood_group?.trim() || null,
      email: formData.email?.trim() || null,
      note: formData.note?.trim() || null,
    };

    if (isEdit && memberToEdit?.meta.member_id) {
      updateMember(
        {
          memberId: memberToEdit.meta.member_id,
          data: payload,
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      addMember(payload, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/75 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                isEdit
                  ? "bg-amber-100 text-amber-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {isEdit ? (
                <HiPencilSquare className="h-5 w-5" />
              ) : (
                <FaUserPlus className="h-4.5 w-4.5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800">
                {isEdit ? "Edit Student Details" : "Add Branch Student"}
              </h3>
              <p className="text-xs text-gray-500">
                {isEdit
                  ? "Update student profile information"
                  : "Manually add a new student to this branch"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <IoClose className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-3 gap-3">
            {/* Serial No Field (Optional Number) */}
            <div className="col-span-1">
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                Serial No{" "}
                <span className="text-xs font-normal text-gray-400">(opt)</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={formData.serial_no ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    serial_no: val === "" ? null : Number(val),
                  }));
                }}
                placeholder="e.g. 1"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Name Field (Required) */}
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                  if (errors.name)
                    setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g. Abdur Rahman"
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none ${
                  errors.name
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Phone Field (Required) */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, phone: e.target.value }));
                if (errors.phone)
                  setErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              placeholder="e.g. 01712345678"
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none ${
                errors.phone
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }`}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Blood Group Field (Optional) */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                Blood Group{" "}
                <span className="text-xs font-normal text-gray-400">(opt)</span>
              </label>
              <select
                value={formData.blood_group || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    blood_group: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            {/* Email Field (Optional) */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                Email{" "}
                <span className="text-xs font-normal text-gray-400">(opt)</span>
              </label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="optional@mail.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Address Field (Optional) */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Address / Area{" "}
              <span className="text-xs font-normal text-gray-400">
                (optional)
              </span>
            </label>
            <input
              type="text"
              value={formData.address || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder="e.g. Uttara, Dhaka"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Note Field (Optional) */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Note / Remarks{" "}
              <span className="text-xs font-normal text-gray-400">
                (optional)
              </span>
            </label>
            <textarea
              rows={2}
              value={formData.note || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, note: e.target.value }))
              }
              placeholder="Any additional information..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Add Student"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditMemberModal;
