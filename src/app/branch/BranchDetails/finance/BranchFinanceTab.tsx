import { useState } from "react";
import { useParams } from "react-router-dom";
import { FaWallet, FaShieldAlt } from "react-icons/fa";
import branchHooks from "@/hooks/useBranch";
import FinanceExport from "./statements/FinanceExport";
import FinanceTransactions from "./transactions/FinanceTransactions";
import FinanceCategories from "./categories/FinanceCategories";
import FinanceOverview from "./overview/FinanceOverview";
import ModeratorCodeModal from "./components/ModeratorCodeModal";

type SubTab = "TRANSACTIONS" | "OVERVIEW" | "CATEGORIES" | "DOWNLOADS";

const BranchFinanceTab = () => {
  const { branchId } = useParams<{ branchId: string }>();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("TRANSACTIONS");
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  // Check if current user is Branch Admin
  const { data: branchDetailsData } = branchHooks.useBranchDetails();
  const meta = branchDetailsData?.data?.meta;
  const isBranchAdmin = !!meta?.is_admin;

  return (
    <div className="space-y-5">
      {/* Header & Sub-tabs */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
              <FaWallet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-950">
                Branch Finance
              </h1>
              <p className="text-xs font-medium text-gray-500">
                Income & Expense tracker for this branch
              </p>
            </div>
          </div>

          {/* Branch Admin only: Moderator Action Code Button */}
          {isBranchAdmin && (
            <button
              type="button"
              onClick={() => setIsCodeModalOpen(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 shadow-2xs transition-all hover:bg-amber-100 active:scale-95 sm:px-3.5 sm:py-2 sm:text-xs"
              title="মডারেটরদের জন্য অ্যাকশন সিকিউরিটি কোড দেখুন বা পরিবর্তন করুন"
            >
              <FaShieldAlt className="h-3.5 w-3.5 text-amber-600" />
              <span>মডারেটর কোড</span>
            </button>
          )}
        </div>

        {/* Sub-navigation */}
        <div className="hide-scrollbar overflow-x-auto px-2 pt-2 sm:px-4">
          <nav
            className="flex w-fit min-w-full items-center justify-center gap-2 sm:gap-6 md:gap-8"
            aria-label="Finance Sub-tabs"
          >
            {(
              [
                { id: "TRANSACTIONS", label: "Transactions" },
                { id: "OVERVIEW", label: "Overview & Reports" },
                { id: "CATEGORIES", label: "Categories" },
                { id: "DOWNLOADS", label: "Monthly Statement" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`shrink-0 border-b-2 px-3 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors sm:px-5 sm:text-sm ${
                  activeSubTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {activeSubTab === "TRANSACTIONS" && <FinanceTransactions />}
      {activeSubTab === "OVERVIEW" && <FinanceOverview />}
      {activeSubTab === "CATEGORIES" && <FinanceCategories />}
      {activeSubTab === "DOWNLOADS" && <FinanceExport />}

      {/* Moderator Action Code Modal */}
      {isBranchAdmin && (
        <ModeratorCodeModal
          isOpen={isCodeModalOpen}
          branchId={branchId as string}
          onClose={() => setIsCodeModalOpen(false)}
        />
      )}
    </div>
  );
};

export default BranchFinanceTab;
