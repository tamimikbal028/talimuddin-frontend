const FriendCardSkeleton = () => {
  return (
    <div className="flex items-center space-x-3 rounded-lg border border-gray-300 bg-white p-3 shadow-sm">
      {/* Avatar Skeleton */}
      <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>

      {/* Info Skeleton */}
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-3 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {/* Actions Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>
  );
};

export default FriendCardSkeleton;

