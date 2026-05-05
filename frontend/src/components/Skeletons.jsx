export function SkeletonLine({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-white/10 ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <SkeletonLine className="h-5 w-2/3 mb-3" />
      <SkeletonLine className="h-4 w-full mb-2" />
      <SkeletonLine className="h-4 w-4/5" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <SkeletonLine className="h-5 w-36 mb-4" />
      <div className="h-64 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
    </div>
  );
}

export function GridCardSkeleton({ count = 3 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}
