import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FaSignInAlt } from "react-icons/fa";
import branchHooks from "@/hooks/useBranch";

type JoinBranchFormValues = {
  joinCode: string;
};

const JoinBranchPage = () => {
  const navigate = useNavigate();
  const { mutate: joinBranch, isPending } = branchHooks.useJoinBranch();

  const { register, handleSubmit, formState } = useForm<JoinBranchFormValues>({
    defaultValues: {
      joinCode: "",
    },
  });

  const { errors } = formState;

  const onSubmit = (data: JoinBranchFormValues) => {
    joinBranch(data.joinCode);
  };

  const handleCancel = () => {
    navigate("/branch");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full space-y-5 rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-green-500 to-green-600 text-white shadow-md">
          <FaSignInAlt className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Join a Branch</h3>
          <p className="mt-0.5 text-xs sm:text-sm font-medium text-gray-500">
            Enter the 6-character join code to join a branch
          </p>
        </div>
      </div>

      {/* Join Code Field */}
      <div>
        <input
          type="text"
          {...register("joinCode", {
            required: "Join code is required",
            pattern: {
              value: /^[A-Z0-9]{6}$/,
              message: "Join code must be 6 characters (letters and numbers)",
            },
          })}
          placeholder="ENTER CODE"
          maxLength={6}
          style={{ textTransform: "uppercase" }}
          autoFocus
          className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-center text-xl sm:text-2xl font-extrabold tracking-widest text-gray-900 placeholder-gray-300 shadow-xs transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
        />
        {errors.joinCode?.message && (
          <p className="mt-1.5 text-center text-xs sm:text-sm font-medium text-red-600">
            {errors.joinCode.message}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={handleCancel}
          className="w-full sm:w-auto cursor-pointer rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-xs transition-colors hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-linear-to-r from-green-600 to-green-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-green-700 hover:to-green-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaSignInAlt className="h-4 w-4" />
          {isPending ? "Joining..." : "Join Branch"}
        </button>
      </div>
    </form>
  );
};

export default JoinBranchPage;
