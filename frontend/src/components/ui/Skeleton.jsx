export default function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`rounded-xl bg-primary/8 animate-pulse ${className}`}
      {...props}
    />
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-surface rounded-2xl border border-primary/8 p-5 ${className}`}
      style={{ boxShadow: 'var(--shadow-card)' }}>
      <Skeleton className="h-4 w-1/3 mb-3" />
      <Skeleton className="h-5 w-full mb-2" />
      <Skeleton className="h-5 w-3/4 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}
