export type TimestampUnit = 'seconds' | 'milliseconds';

/** 11+ digits is treated as milliseconds (covers all dates from 2001 onward in ms form). */
export function detectUnit(raw: string): TimestampUnit {
  const digits = raw.trim().replace(/[^0-9]/g, '');
  return digits.length >= 11 ? 'milliseconds' : 'seconds';
}

export function parseTimestampInput(raw: string): { ms: number; unit: TimestampUnit } | null {
  const trimmed = raw.trim();
  if (!/^-?\d+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return null;
  const unit = detectUnit(trimmed);
  const ms = unit === 'seconds' ? value * 1000 : value;
  return { ms, unit };
}

export function toUnixSeconds(ms: number): number {
  return Math.floor(ms / 1000);
}

/** `YYYY-MM-DD HH:mm:ss` in the given IANA time zone. Returns null for an invalid timestamp. */
export function formatInZone(ms: number, timeZone: string): string | null {
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;
}

/** Parses a `<input type="datetime-local">` value (local wall-clock time, no zone) to epoch ms. */
export function parseLocalDateTime(value: string): number | null {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? null : ms;
}

export const COMMON_ZONES = [
  { id: 'Asia/Shanghai', label: '中国标准时间' },
  { id: 'UTC', label: 'UTC' },
  { id: 'America/New_York', label: '纽约' },
  { id: 'Europe/London', label: '伦敦' },
  { id: 'Asia/Tokyo', label: '东京' },
] as const;
