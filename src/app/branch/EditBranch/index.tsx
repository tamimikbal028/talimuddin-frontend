import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaInfoCircle } from "react-icons/fa";
import PageLoader from "@/app/shared/PageLoader";
import branchHooks from "@/hooks/useBranch";
import BranchGeneralTab from "./BranchGeneralTab";
import EditPageWrapper, { type TabConfig } from "@/app/shared/EditPageWrapper";

type TabType = "general";

const EditBranchPage = () => {
  const navigate = useNavigate();
  const { data: branchData, isLoading, error } = branchHooks.useBranchDetails();
  const [activeTab, setActiveTab] = useState<TabType>("general");

  if (isLoading) return <PageLoader />;
  if (error || !branchData) {
    return (
      <div className="animate-in fade-in zoom-in-95 flex h-[80vh] flex-col items-center justify-center gap-6 duration-500">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
          <FaInfoCircle className="text-4xl" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900">Branch Not Found</h1>
          <p className="mt-2 font-medium text-gray-500">
            The branch you're trying to manage doesn't exist or has been removed.
          </p>
        </div>
        <button
          onClick={() => navigate("/branch")}
          className="mt-4 cursor-pointer rounded-xl bg-gray-900 px-8 py-3 font-bold text-white shadow-lg shadow-gray-200 transition-all hover:bg-gray-800 active:scale-95"
        >
          Back to Branches
        </button>
      </div>
    );
  }

  const { branch, meta } = branchData.data;

  // Security: Only creator and admin can access
  if (!meta.is_creator && !meta.is_admin) {
    navigate(`/branch/branches/${branch.id}`);
    return null;
  }

  const tabs: TabConfig<TabType>[] = [
    {
      id: "general",
      label: "Basic Info",
      icon: <FaInfoCircle />,
      content: <BranchGeneralTab branch={branch} />,
    },
  ];

  return (
    <EditPageWrapper
      title="Manage Branch"
      subtitle={branch.name}
      backUrl={`/branch/branches/${branch.id}`}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
};

export default EditBranchPage;
