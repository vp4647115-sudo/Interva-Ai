export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-border/60 ${className}`} aria-hidden />;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-card bg-error-soft p-6 text-center">
      <p className="font-semibold text-error">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 rounded-pill border border-error px-5 py-2 text-sm font-semibold text-error">
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-card bg-surface p-10 text-center shadow-card">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-secondary">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
