interface CategoryOption {
  id: string;
  name: string;
  type: string;
}

interface TransactionFiltersProps {
  type: string;
  setType: (val: string) => void;
  categoryId: string;
  setCategoryId: (val: string) => void;
  paymentStatus: string;
  setPaymentStatus: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  categories: CategoryOption[];
  onClearFilters: () => void;
}

const TransactionFilters = ({
  type,
  setType,
  categoryId,
  setCategoryId,
  paymentStatus,
  setPaymentStatus,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  categories,
  onClearFilters,
}: TransactionFiltersProps) => {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-xs sm:p-4">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {/* Type Filter */}
        <div>
          <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Transactions</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.type === "INCOME" ? "Income" : "Expense"})
              </option>
            ))}
          </select>
        </div>

        {/* Payment Status Filter */}
        <div>
          <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            Status
          </label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PAID">পরিশোধিত (Paid)</option>
            <option value="HAS_DUE">সকল বকেয়া (Has Due)</option>
            <option value="PARTIAL">আংশিক বাকি (Partial)</option>
            <option value="DUE">সম্পূর্ণ বাকি (Full Due)</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onClick={(e) => {
              try {
                e.currentTarget.showPicker?.();
              } catch {
                // Ignore browsers that do not support showPicker
              }
            }}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none [&::-webkit-calendar-picker-indicator]:hidden"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onClick={(e) => {
              try {
                e.currentTarget.showPicker?.();
              } catch {
                // Ignore browsers that do not support showPicker
              }
            }}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none [&::-webkit-calendar-picker-indicator]:hidden"
          />
        </div>

        {/* Clear Filters */}
        <div className="col-span-2 flex items-end sm:col-span-1">
          <button
            onClick={onClearFilters}
            className="w-full cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;
