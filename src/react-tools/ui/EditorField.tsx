import type { ReactNode, TextareaHTMLAttributes } from 'react';

interface EditorFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  /** Character counter shown bottom-right; pass false to hide. */
  counter?: ReactNode | false;
  /** Read-only result pane: tinted background with room for a copy button. */
  output?: boolean;
  /** Extra content positioned inside the field (e.g. a CopyButton). */
  children?: ReactNode;
}

export function EditorField({
  label,
  counter = false,
  output = false,
  children,
  className = '',
  ...rest
}: EditorFieldProps) {
  return (
    <label className={`relative block! ${output ? 'mt-5' : ''} ${className}`}>
      <span className="mb-2 block text-[12px] font-medium text-muted">{label}</span>
      <textarea
        spellCheck={false}
        className={`w-full min-h-[180px] resize-y rounded-control! border border-line p-3.5 font-mono text-[13px] leading-[1.7] text-ink outline-none transition duration-150 focus:border-ink focus:ring-2 focus:ring-ink/5 ${
          output ? 'bg-surface-2 pb-10' : 'bg-paper'
        }`}
        {...rest}
      />
      {counter !== false ? (
        <small className="absolute right-3 bottom-[10px] font-mono text-[11px] text-muted">{counter}</small>
      ) : null}
      {children}
    </label>
  );
}
