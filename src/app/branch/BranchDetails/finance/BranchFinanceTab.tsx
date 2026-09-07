import { useState } from "react";
import { FaWallet } from "react-icons/fa";
import FinanceExport from "./statements/FinanceExport";
import FinanceTransactions from "./transactions/FinanceTransactions";
import FinanceCategories from "./categories/FinanceCategories";
import FinanceOverview from "./overview/FinanceOverview";

type SubTab = "TRANSACTIONS" | "OVERVIEW" | "CATEGORIES" | "DOWNLOADS";

const BranchFinanceTab = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("TRANSACTIONS");

  return (
    <div className="space-y-5">
      {/* Header & Sub-tabs */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
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
    </div>
  );
};

export default BranchFinanceTab;
