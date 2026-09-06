const BranchDetailsSkeleton = () => {
  return (
    <div className="space-y-5">
      {/* Header Skeleton Matching BranchHeader */}
      <div>
        {/* Cover Image Skeleton */}
        <div className="relative h-48 w-full animate-pulse bg-gray-200"></div>

        {/* Header Content Area */}
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-5xl space-y-3 p-5">
            {/* Row 1: Back + Name + 3-dot action button */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-gray-100"></div>
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-8 w-60 animate-pulse rounded-lg bg-gray-200"></div>
                <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-gray-200"></div>
              </div>
            </div>

            {/* Row 2: Badges & Member Count */}
            <div className="flex items-center gap-3">
              <div className="h-5 w-20 animate-pulse rounded-full bg-gray-100"></div>
              <div className="h-5 w-24 animate-pulse rounded bg-gray-200"></div>
            </div>

            {/* Row 2: Description */}
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-gray-100"></div>
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100"></div>
            </div>
          </div>

          {/* Tab Navigation Skeleton */}
          <div className="mx-auto max-w-5xl px-6">
            <div className="flex items-center justify-between sm:gap-4 md:gap-8">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-24 animate-pulse rounded bg-gray-100"
                ></div>
              ))}
              {/* More Button Skeleton */}
              <div className="h-10 w-20 animate-pulse rounded bg-gray-100"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-5xl">
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 w-full animate-pulse rounded-lg bg-white p-4 shadow"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BranchDetailsSkeleton;
