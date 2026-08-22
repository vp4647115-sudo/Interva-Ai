export default function DashboardPlaceholder() {
  // Phase 2 delivers the real onboarding + dashboard. This placeholder exists so
  // auth flows have a post-login destination.
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="max-w-md rounded-card bg-surface p-10 text-center shadow-card">
        <h1 className="text-2xl font-extrabold">You&apos;re in 🎉</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          The dashboard and onboarding wizard arrive in Phase 2. Authentication is working
          end to end.
        </p>
      </div>
    </main>
  );
}
