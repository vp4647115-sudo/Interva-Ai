import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 py-16 text-center">
      <div className="max-w-xl">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">404 — Page not found</p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink-primary sm:text-5xl">
          This page took a wrong turn.
        </h1>
        <p className="mt-4 text-base leading-7 text-ink-secondary">
          The link may be outdated, or the page may have moved. Try the home page or explore our interview resources.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link className="rounded-input bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover" href="/">
            Return home
          </Link>
          <Link className="rounded-input border border-border px-5 py-3 text-sm font-semibold text-ink-primary hover:bg-surface-alt" href="/interview-guides">
            Browse interview guides
          </Link>
        </div>
      </div>
    </main>
  );
}
