import clsx from "clsx";

export function AuthCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        "w-full max-w-[460px] rounded-card bg-surface p-5 shadow-card sm:p-8 md:p-10",
        className
      )}
    >
      {children}
    </div>
  );
}
