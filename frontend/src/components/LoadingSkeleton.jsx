export function SkeletonGrid({ count = 4, height = "h-80" }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className={`bg-gray-100 rounded-lg ${height} animate-pulse`} />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 3, height = "h-24" }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className={`bg-gray-100 rounded-lg ${height} animate-pulse`} />
      ))}
    </div>
  );
}

export function SkeletonBlock({ height = "h-64" }) {
  return <div className={`${height} bg-gray-100 animate-pulse rounded-xl`} />;
}
