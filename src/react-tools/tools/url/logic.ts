export type UrlCodecMode = 'component' | 'full';

export function encodeValue(value: string, mode: UrlCodecMode): string {
  return mode === 'component' ? encodeURIComponent(value) : encodeURI(value);
}

export type DecodeResult = { ok: true; value: string } | { ok: false; error: string };

export function decodeValue(value: string, mode: UrlCodecMode): DecodeResult {
  try {
    return { ok: true, value: mode === 'component' ? decodeURIComponent(value) : decodeURI(value) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : '解码失败，请检查百分号编码是否完整' };
  }
}

export interface QueryParam {
  key: string;
  value: string;
}

/** Accepts a full URL, a `?a=b&c=d` query string, or a bare `a=b&c=d` string. */
export function parseQueryParams(input: string): QueryParam[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  let search: string;
  try {
    search = new URL(trimmed).search;
  } catch {
    const questionIndex = trimmed.indexOf('?');
    search = questionIndex === -1 ? trimmed : trimmed.slice(questionIndex + 1);
  }

  const params = new URLSearchParams(search.replace(/^\?/, ''));
  return [...params.entries()].map(([key, value]) => ({ key, value }));
}
