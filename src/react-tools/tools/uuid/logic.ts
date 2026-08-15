export interface UuidFormatOptions {
  uppercase?: boolean;
  hyphens?: boolean;
}

export const COUNT_MIN = 1;
export const COUNT_MAX = 100;

export function formatUuid(uuid: string, { uppercase = false, hyphens = true }: UuidFormatOptions = {}) {
  const value = hyphens ? uuid : uuid.replace(/-/g, '');
  return uppercase ? value.toUpperCase() : value.toLowerCase();
}

export function clampCount(count: number) {
  if (!Number.isFinite(count)) return COUNT_MIN;
  return Math.max(COUNT_MIN, Math.min(COUNT_MAX, Math.floor(count)));
}

export function generateUuids(count: number, options: UuidFormatOptions = {}) {
  const n = clampCount(count);
  return Array.from({ length: n }, () => formatUuid(crypto.randomUUID(), options));
}
