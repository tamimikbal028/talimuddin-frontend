import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export interface TabConfig<T extends string = string> {
  id: T;
  label: string;
  icon: ReactNode;
  content: ReactNode;
}

interface EditPageWrapperProps<T extends string = string> {
  title: string;
  subtitle?: string | null;
  backUrl?: string;
  onBack?: () => void;
  tabs: TabConfig<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
}

const EditPageWrapper = <T extends string>({
  title,
  subtitle,
  backUrl,
  onBack,
  tabs,
  activeTab,
  onTabChange,
}: EditPageWrapperProps<T>) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  const activeTabContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4">
          {/* Title Section */}
          <div className="flex items-center justify-between border-b border-gray-100 py-5">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border-none bg-gray-100 text-gray-600 transition-all outline-none hover:bg-gray-200 hover:text-gray-900 active:scale-95"
                aria-label="Go back"
              >
                <FaArrowLeft className="text-base" />
              </button>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs font-semibold text-gray-500">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="no-scrollbar flex gap-2 overflow-x-auto py-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl border-none px-5 py-2.5 text-sm font-semibold transition-all duration-200 outline-none ${
                  activeTab === tab.id
                    ? "bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-200"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mx-auto max-w-4xl px-4 pt-10">
        <div className="flex flex-col gap-8">{activeTabContent}</div>
      </div>
    </div>
  );
};

export default EditPageWrapper;
