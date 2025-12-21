import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  children: ReactNode;
  className?: string;
}

export default function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses = "px-6 py-3 rounded-2xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--focusRing)] focus:ring-opacity-50";
  
  const variantClasses = {
    primary: "bg-[var(--primary)] text-black hover:bg-[var(--primaryHover)] shadow-sm hover:shadow-md hover:-translate-y-0.5",
    secondary: "bg-[var(--secondary)] text-black hover:bg-[var(--secondaryHover)] shadow-sm hover:shadow-md hover:-translate-y-0.5",
    ghost: "bg-transparent text-black hover:bg-[var(--surface2)] border border-[var(--border)]",
    destructive: "bg-[var(--danger)] text-black hover:bg-[var(--dangerHover)] shadow-sm hover:shadow-md hover:-translate-y-0.5",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

