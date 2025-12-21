"use client";

interface SegmentedToggleProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export default function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  className = "",
}: SegmentedToggleProps<T>) {
  return (
    <div
      className={`inline-flex rounded-3xl border-2 border-[var(--border)] bg-[var(--surface2)] p-1 ${className}`}
      role="tablist"
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={`
              relative px-4 py-2 rounded-2xl font-semibold transition-all duration-200
              ${
                isActive
                  ? "bg-[var(--primary)] text-[var(--primaryText)] shadow-sm"
                  : "text-[var(--textMuted)] hover:text-[var(--text)]"
              }
            `}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

