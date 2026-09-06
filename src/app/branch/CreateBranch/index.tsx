import { Navigate, useNavigate } from "react-router-dom";
import CreateBranchForm from "@/app/branch/CreateBranch/CreateBranchForm";
import authHooks from "@/hooks/useAuth";
import { USER_TYPES } from "@/constants";

const CreateBranchPage = () => {
  const navigate = useNavigate();
  const { user, isCheckingAuth } = authHooks.useUser();

  if (isCheckingAuth) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mt-4 space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.user_type !== USER_TYPES.ADMIN) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
        <p className="text-sm font-semibold text-amber-700">
          Access restricted
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Only admins can create branches
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">
          Your account type does not have branch creation access. You can still
          join branches with a code from the branch area.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/branch")}
            className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            Go back to Branch
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Create New Branch</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <CreateBranchForm />
      </div>
    </>
  );
};

export default CreateBranchPage;
