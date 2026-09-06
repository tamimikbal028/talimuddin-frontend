// Skeletons and loading indicators for Branch Finance tabs

export const TransactionsTableSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs sm:text-sm">
          <thead className="border-b border-gray-200 bg-gray-50/80 text-[11px] font-bold tracking-wider text-gray-500 uppercase sm:text-xs">
            <tr>
              <th className="px-3 py-3 whitespace-nowrap sm:px-5">Date</th>
              <th className="px-3 py-3 whitespace-nowrap sm:px-5">Category</th>
              <th className="px-3 py-3 whitespace-nowrap sm:px-5">Person Name</th>
              <th className="px-3 py-3 text-right whitespace-nowrap sm:px-5">Amount</th>
              <th className="px-3 py-3 text-center whitespace-nowrap sm:px-5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="animate-pulse">
                {/* Date */}
                <td className="px-3 py-3.5 sm:px-5">
                  <div className="h-4 w-20 rounded bg-gray-200" />
                </td>

                {/* Category */}
                <td className="px-3 py-3.5 sm:px-5">
                  <div className="space-y-1.5">
                    <div className="h-4 w-24 rounded bg-gray-200" />
                    <div className="h-3 w-14 rounded-full bg-gray-100" />
                  </div>
                </td>

                {/* Person Name */}
                <td className="px-3 py-3.5 sm:px-5">
                  <div className="space-y-1.5">
                    <div className="h-4 w-28 rounded bg-gray-200" />
                    <div className="h-3 w-20 rounded bg-gray-100" />
                  </div>
                </td>

                {/* Amount */}
                <td className="px-3 py-3.5 sm:px-5">
                  <div className="ml-auto h-4 w-16 rounded bg-gray-200" />
                </td>

                {/* Actions */}
                <td className="px-3 py-3.5 sm:px-5">
                  <div className="mx-auto flex justify-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-gray-100" />
                    <div className="h-6 w-6 rounded-md bg-gray-100" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const CategoriesTableSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50/80 text-xs font-bold tracking-wider text-gray-500 uppercase">
            <tr>
              <th className="px-5 py-3.5">Category Name</th>
              <th className="px-5 py-3.5 text-center">Type</th>
              <th className="px-5 py-3.5 text-right">Income</th>
              <th className="px-5 py-3.5 text-right">Expense</th>
              <th className="px-5 py-3.5 text-right">Net Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="animate-pulse">
                {/* Category Name & Icon */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-gray-100" />
                    <div className="h-4 w-28 rounded bg-gray-200" />
                    <div className="h-4 w-6 rounded-full bg-gray-100" />
                  </div>
                </td>

                {/* Type */}
                <td className="px-5 py-4 text-center whitespace-nowrap">
                  <div className="mx-auto h-5 w-16 rounded-full bg-gray-100" />
                </td>

                {/* Income */}
                <td className="px-5 py-4 text-right whitespace-nowrap">
                  <div className="ml-auto h-4 w-20 rounded bg-gray-200" />
                </td>

                {/* Expense */}
                <td className="px-5 py-4 text-right whitespace-nowrap">
                  <div className="ml-auto h-4 w-20 rounded bg-gray-200" />
                </td>

                {/* Net Balance */}
                <td className="px-5 py-4 text-right whitespace-nowrap">
                  <div className="ml-auto h-4 w-20 rounded bg-gray-200" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const OverviewSkeleton = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3 sm:gap-5">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-gray-100 bg-white p-4 shadow-xs sm:p-5"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 rounded bg-gray-200" />
              <div className="h-8 w-8 rounded-lg bg-gray-100" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-7 w-32 rounded bg-gray-200" />
              <div className="h-3 w-40 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Statistics Section */}
      <div className="space-y-3">
        <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xs"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-50 bg-gray-50/50 px-4 py-3 sm:px-5">
                <div className="h-4 w-28 rounded bg-gray-200" />
                <div className="h-5 w-20 rounded-full bg-gray-200" />
              </div>

              <div className="p-4 sm:p-5 space-y-4">
                {/* 2 columns Income / Expense */}
                <div className="grid grid-cols-2 gap-4 border-b border-gray-50 pb-4">
                  <div className="space-y-2">
                    <div className="h-3 w-14 rounded bg-gray-100" />
                    <div className="h-4 w-20 rounded bg-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-14 rounded bg-gray-100" />
                    <div className="h-4 w-20 rounded bg-gray-200" />
                  </div>
                </div>

                {/* Category breakdown items */}
                <div className="space-y-2.5">
                  <div className="h-3 w-32 rounded bg-gray-100" />
                  <div className="space-y-2">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-gray-200" />
                          <div className="h-3.5 w-24 rounded bg-gray-200" />
                        </div>
                        <div className="h-3.5 w-16 rounded bg-gray-200" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ExportStatementSkeleton = () => {
  return (
    <div className="animate-pulse space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="space-y-2">
          <div className="h-6 w-56 rounded bg-gray-200" />
          <div className="h-3.5 w-40 rounded bg-gray-100" />
        </div>
        <div className="space-y-1.5 text-right">
          <div className="ml-auto h-3 w-28 rounded bg-gray-100" />
          <div className="ml-auto h-3.5 w-20 rounded bg-gray-200" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-100 bg-gray-50/60 p-3.5 space-y-1.5">
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="h-5 w-28 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="space-y-3 pt-2">
        <div className="h-4 w-28 rounded bg-gray-200" />
        <div className="overflow-hidden rounded-lg border border-gray-100">
          <div className="border-b border-gray-100 bg-gray-50 p-3">
            <div className="flex justify-between">
              <div className="h-3.5 w-20 rounded bg-gray-200" />
              <div className="h-3.5 w-20 rounded bg-gray-200" />
              <div className="h-3.5 w-20 rounded bg-gray-200" />
            </div>
          </div>
          <div className="divide-y divide-gray-100 p-3 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between pt-2">
                <div className="h-3.5 w-24 rounded bg-gray-100" />
                <div className="h-3.5 w-20 rounded bg-gray-100" />
                <div className="h-3.5 w-16 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const FetchingIndicator = ({
  isFetching,
  isLoading,
}: {
  isFetching: boolean;
  isLoading: boolean;
}) => {
  if (!isFetching || isLoading) return null;
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/90 px-2.5 py-0.5 text-xs font-semibold text-blue-600 shadow-2xs">
      <span className="inline-block h-1.5 w-1.5 animate-ping rounded-full bg-blue-600" />
      <span>Fetching updates...</span>
    </div>
  );
};
