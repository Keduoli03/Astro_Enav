import { useEffect, useState } from 'react';

/**
 * Creates an object URL for `blob` and revokes it automatically when `blob`
 * changes or the component unmounts. Tools that preview a File/Blob (image
 * previews, generated downloads) should use this instead of hand-managing
 * `URL.createObjectURL`/`revokeObjectURL` pairs.
 */
export function useObjectUrl(blob: Blob | null | undefined): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!blob) { setUrl(undefined); return; }
    const next = URL.createObjectURL(blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [blob]);

  return url;
}
