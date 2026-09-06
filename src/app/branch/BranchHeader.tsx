import { Link } from "react-router-dom";
import { FaPlus, FaCodeBranch } from "react-icons/fa";
import authHooks from "@/hooks/useAuth";
import { USER_TYPES } from "@/constants";

const BranchHeader = () => {
  const { user } = authHooks.useUser();
  const is_app_admin = user?.user_type === USER_TYPES.ADMIN;

  return (
    <header className="flex items-center justify-between gap-2 sm:gap-4">
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-md sm:h-12 sm:w-12 sm:rounded-2xl">
          <FaCodeBranch className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold tracking-tight text-gray-900 sm:text-2xl sm:whitespace-normal">
            Branch Management
          </h1>
          <p className="text-xs text-gray-600 sm:text-sm">
            Manage institution branches.
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {is_app_admin && (
          <Link
            to="/branch/createbranch"
            className="flex h-9 w-9 items-center justify-center gap-2 rounded-full border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 shadow-xs transition-colors hover:bg-blue-100 sm:h-auto sm:w-auto sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
            title="Create Branch"
          >
            <FaPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Branch</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default BranchHeader;
