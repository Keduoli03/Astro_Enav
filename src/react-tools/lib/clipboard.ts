import { useState } from 'react';

const RESET_DELAY = 1400;

/** Owns the "copied" flash timer so tools don't each re-implement it. */
export function useCopy(resetDelay = RESET_DELAY) {
  const [copied, setCopied] = useState(false);

  const copy = async (value: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), resetDelay);
  };

  return { copied, copy };
}
