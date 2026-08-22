import clsx from "clsx";
import Link from "next/link";

type Variant = "primary" | "secondary" | "success" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "bg-white text-ink-primary border border-border hover:bg-surface-alt",
  success: "bg-success text-white hover:bg-success/90",
  ghost: "text-ink-secondary hover:bg-surface-alt",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm font-semibold",
  lg: "px-8 py-4 text-base font-bold",
};

interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: keyof typeof sizes;
}

export function PillButton({ variant = "primary", size = "md", className, ...props }: PillButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-pill transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export function PillLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex items-center justify-center rounded-pill transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </Link>
  );
}
