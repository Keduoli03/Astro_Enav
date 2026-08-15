import { describe, expect, it } from 'vitest';
import { detectUnit, formatInZone, parseLocalDateTime, parseTimestampInput, toUnixSeconds } from './logic';

describe('detectUnit', () => {
  it('treats 10-digit numbers as seconds', () => {
    expect(detectUnit('1700000000')).toBe('seconds');
  });

  it('treats 13-digit numbers as milliseconds', () => {
    expect(detectUnit('1700000000000')).toBe('milliseconds');
  });

  it('ignores a leading minus sign when counting digits', () => {
    expect(detectUnit('-1700000000')).toBe('seconds');
  });
});

describe('parseTimestampInput', () => {
  it('parses a seconds timestamp into ms', () => {
    const result = parseTimestampInput('1700000000');
    expect(result).toEqual({ ms: 1700000000000, unit: 'seconds' });
  });

  it('parses a milliseconds timestamp as-is', () => {
    const result = parseTimestampInput('1700000000000');
    expect(result).toEqual({ ms: 1700000000000, unit: 'milliseconds' });
  });

  it('rejects non-numeric input', () => {
    expect(parseTimestampInput('not-a-number')).toBeNull();
    expect(parseTimestampInput('12.5')).toBeNull();
    expect(parseTimestampInput('')).toBeNull();
  });

  it('accepts negative timestamps (pre-1970)', () => {
    const result = parseTimestampInput('-1000000000');
    expect(result?.ms).toBe(-1000000000000);
  });
});

describe('toUnixSeconds', () => {
  it('floors milliseconds down to whole seconds', () => {
    expect(toUnixSeconds(1700000000999)).toBe(1700000000);
  });
});

describe('formatInZone', () => {
  it('formats a known epoch in UTC', () => {
    // 2023-11-14T22:13:20.000Z
    expect(formatInZone(1700000000000, 'UTC')).toBe('2023-11-14 22:13:20');
  });

  it('returns null for an invalid timestamp', () => {
    expect(formatInZone(Number.NaN, 'UTC')).toBeNull();
  });

  it('shifts across the date line for a different zone', () => {
    expect(formatInZone(1700000000000, 'Asia/Tokyo')).toBe('2023-11-15 07:13:20');
  });
});

describe('parseLocalDateTime', () => {
  it('parses a datetime-local value', () => {
    const ms = parseLocalDateTime('2024-01-15T08:30');
    expect(ms).toBe(new Date('2024-01-15T08:30').getTime());
  });

  it('returns null for empty input', () => {
    expect(parseLocalDateTime('')).toBeNull();
  });

  it('returns null for garbage input', () => {
    expect(parseLocalDateTime('not-a-date')).toBeNull();
  });
});
