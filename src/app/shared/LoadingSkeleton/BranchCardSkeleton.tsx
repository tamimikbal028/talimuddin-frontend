const BranchCardSkeleton = () => {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg shadow-sm">
      <div className="relative block h-36 w-full bg-gray-200">
        {/* Overlay style matching bg-black/85 */}
        <div className="absolute top-0 left-0 w-full bg-gray-300 p-2">
          {/* Branch Name Skeleton */}
          <div className="mb-2 h-4 w-3/4 rounded bg-gray-400"></div>
          {/* Creator Name Skeleton */}
          <div className="h-3 w-1/2 rounded bg-gray-400 opacity-60"></div>
        </div>
      </div>
    </div>
  );
};

export default BranchCardSkeleton;
