export default function Loading() {
  return (
    <main aria-label="Loading page" aria-busy="true" className="mx-auto min-h-screen max-w-6xl px-6 py-12">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-40 rounded-lg bg-surface-alt" />
        <div className="h-12 max-w-xl rounded-lg bg-surface-alt" />
        <div className="h-5 max-w-3xl rounded-lg bg-surface-alt" />
        <div className="grid gap-5 pt-8 md:grid-cols-3">
          {[0, 1, 2].map((item) => <div key={item} className="h-48 rounded-2xl border border-border bg-surface-alt" />)}
        </div>
        <span className="sr-only">Loading content…</span>
      </div>
    </main>
  );
}
