import type { ReactNode } from 'react';

interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  'aria-label'?: string;
}

export function Segmented<T extends string>({ options, value, onChange, ...rest }: SegmentedProps<T>) {
  return (
    <div
      className="mb-5 grid gap-1 rounded-[11px]! bg-surface-2 p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
      {...rest}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`h-[38px] cursor-pointer whitespace-nowrap rounded-[8px]! border-0 px-3 text-[12.5px] font-semibold transition duration-150 ${
            value === option.value ? 'bg-surface text-ink shadow-sm' : 'bg-transparent text-muted hover:text-ink'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 rounded-[9px]! bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] px-3 py-2.5 text-[12px] text-accent">
      {children}
    </p>
  );
}
