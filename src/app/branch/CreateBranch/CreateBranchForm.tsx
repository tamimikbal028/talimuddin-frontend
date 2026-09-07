import { useForm } from "react-hook-form";
import { FaCodeBranch, FaBuilding, FaSitemap } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import branchHooks from "@/hooks/useBranch";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const branchSchema = z
  .object({
    name: z
      .string()
      .min(3, "Branch name must be at least 3 characters")
      .max(50, "Branch name must not exceed 50 characters")
      .trim(),
    description: z.string().optional(),
    branch_type: z.enum(["MAIN", "SUB"]),
    parent_branch_id: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.branch_type === "SUB") {
        return (
          !!data.parent_branch_id && data.parent_branch_id.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Please select a main branch for this sub branch",
      path: ["parent_branch_id"],
    }
  );

export type BranchFormValues = z.infer<typeof branchSchema>;

const CreateBranchForm = () => {
  const navigate = useNavigate();

  const { mutate: createBranch, isPending } = branchHooks.useCreateBranch();
  const { data: mainBranchesData, isLoading: isLoadingMainBranches } =
    branchHooks.useMainBranches();

  const mainBranches = mainBranchesData?.data?.branches || [];

  const { register, handleSubmit, watch, setValue, formState } =
    useForm<BranchFormValues>({
      resolver: zodResolver(branchSchema),
      defaultValues: {
        name: "",
        description: "",
        branch_type: "MAIN",
        parent_branch_id: "",
      },
    });

  const { errors } = formState;
  const selectedBranchType = watch("branch_type");

  const handleCreate = (data: BranchFormValues) => {
    createBranch(
      {
        name: data.name,
        description: data.description?.trim() || undefined,
        branch_type: data.branch_type,
        parent_branch_id:
          data.branch_type === "SUB" ? data.parent_branch_id : null,
      },
      {
        onSuccess: () => {
          navigate("/branch");
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(handleCreate)} className="w-full space-y-5">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-600 text-white shadow-lg sm:h-12 sm:w-12">
          <FaCodeBranch className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
            Create a New Branch
          </h3>
          <p className="mt-0.5 text-xs font-medium text-gray-500 sm:text-sm">
            Set up an institution branch workspace
          </p>
        </div>
      </div>

      {/* Branch Type Selector */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm">
          Branch Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Main Branch Option */}
          <div
            onClick={() => {
              setValue("branch_type", "MAIN");
              setValue("parent_branch_id", "");
            }}
            className={`cursor-pointer rounded-xl border p-4 transition-all ${
              selectedBranchType === "MAIN"
                ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  selectedBranchType === "MAIN"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <FaBuilding className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">
                    Main Branch
                  </span>
                  <input
                    type="radio"
                    value="MAIN"
                    {...register("branch_type")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <p className="mt-0.5 text-xs text-gray-500">
                  Primary independent branch
                </p>
              </div>
            </div>
          </div>

          {/* Sub Branch Option */}
          <div
            onClick={() => setValue("branch_type", "SUB")}
            className={`cursor-pointer rounded-xl border p-4 transition-all ${
              selectedBranchType === "SUB"
                ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  selectedBranchType === "SUB"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <FaSitemap className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">
                    Sub Branch
                  </span>
                  <input
                    type="radio"
                    value="SUB"
                    {...register("branch_type")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <p className="mt-0.5 text-xs text-gray-500">
                  Affiliated under a main branch
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown for Sub Branch: Select Parent Main Branch */}
      {selectedBranchType === "SUB" && (
        <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 transition-all">
          <label className="mb-2 block text-xs font-semibold text-gray-800 sm:text-sm">
            Select Main Branch <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              {...register("parent_branch_id")}
              disabled={isLoadingMainBranches}
              className="block w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-xs transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:bg-gray-100 sm:text-base"
            >
              <option value="">-- Choose a Main Branch --</option>
              {mainBranches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          {isLoadingMainBranches && (
            <p className="mt-1.5 text-xs text-blue-600">
              Loading main branches...
            </p>
          )}

          {!isLoadingMainBranches && mainBranches.length === 0 && (
            <p className="mt-2 text-xs font-medium text-amber-600 sm:text-sm">
              ⚠️ No main branches found. Please create a main branch first.
            </p>
          )}

          {errors.parent_branch_id?.message && (
            <p className="mt-1.5 text-xs text-red-600 sm:text-sm">
              {errors.parent_branch_id.message}
            </p>
          )}
        </div>
      )}

      {/* Branch Name Field */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm">
          Branch Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("name")}
          maxLength={50}
          placeholder={
            selectedBranchType === "SUB"
              ? "e.g., Mirpur Section Sub-Branch"
              : "e.g., Dhaka Campus Branch"
          }
          className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-xs transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none sm:text-base"
        />
        {errors.name?.message && (
          <p className="mt-1.5 text-xs text-red-600 sm:text-sm">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm">
          Description
        </label>
        <textarea
          {...register("description")}
          placeholder="Brief description of the branch (optional)"
          rows={3}
          className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-xs transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none sm:text-base"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse gap-2.5 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
        <button
          type="button"
          onClick={() => navigate("/branch")}
          className="w-full cursor-pointer rounded-lg border border-red-500 bg-white px-5 py-2.5 text-sm font-semibold text-red-500 shadow-xs transition-colors hover:bg-red-50 sm:w-auto"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
        >
          {isPending ? "Creating..." : "Create Branch"}
        </button>
      </div>
    </form>
  );
};

export default CreateBranchForm;
