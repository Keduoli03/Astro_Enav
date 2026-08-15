import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const BASE =
  'inline-flex min-h-[40px] cursor-pointer items-center justify-center gap-2 rounded-control! border px-4 text-[13px] font-semibold leading-none no-underline transition duration-150 hover:-translate-y-px hover:shadow-sm active:translate-y-0 disabled:pointer-events-none disabled:opacity-45';

const VARIANTS: Record<Variant, string> = {
  primary: 'border-ink bg-ink text-paper hover:bg-[#24242a]',
  secondary: 'border-line bg-surface text-ink hover:border-ink/40 hover:bg-surface-2',
};

export function Button({ variant = 'secondary', className = '', children, ...rest }: ButtonProps) {
  return (
    <button className={`${BASE} ${VARIANTS[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

/** Anchor styled as a Button — for download links and cross-page actions. */
export function ButtonLink({
  variant = 'secondary',
  className = '',
  children,
  ...rest
}: { variant?: Variant; children: ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={`${BASE} ${VARIANTS[variant]} ${className}`} {...rest}>
      {children}
    </a>
  );
}

export function ButtonRow({ between = false, children }: { between?: boolean; children: ReactNode }) {
  return (
    <div
      className={`mt-4 flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center ${
        between ? 'sm:justify-between' : 'sm:justify-end'
      }`}
    >
      {children}
    </div>
  );
}
