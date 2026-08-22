import clsx from "clsx";

export function AuthCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        "w-full max-w-[460px] rounded-card bg-surface p-8 shadow-card md:p-10",
        className
      )}
    >
      {children}
    </div>
  );
}
