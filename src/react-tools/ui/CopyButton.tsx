import { Check, Clipboard } from 'lucide-react';
import { useCopy } from '../lib/clipboard';

interface CopyButtonProps {
  value: string;
  /** Absolutely position inside a relative parent (e.g. an EditorField). */
  inField?: boolean;
  className?: string;
  label?: string;
  copiedLabel?: string;
}

/** Thin wrapper around useCopy for the common icon+label button shape. */
export function CopyButton({
  value,
  inField = false,
  className = '',
  label = '复制',
  copiedLabel = '已复制',
}: CopyButtonProps) {
  const { copied, copy } = useCopy();

  return (
    <button
      type="button"
      onClick={() => copy(value)}
      disabled={!value}
      className={`flex h-[30px] cursor-pointer items-center gap-1.5 rounded-[8px]! border border-line bg-surface px-2.5 text-[11px] font-medium text-muted transition duration-150 hover:border-ink/40 hover:text-ink disabled:cursor-default disabled:opacity-45 ${
        inField ? 'absolute right-[9px] bottom-[9px]' : ''
      } ${className}`}
    >
      {copied ? <Check size={15} /> : <Clipboard size={15} />} {copied ? copiedLabel : label}
    </button>
  );
}
