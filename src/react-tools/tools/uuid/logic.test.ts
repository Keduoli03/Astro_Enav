import { describe, expect, it } from 'vitest';
import { clampCount, COUNT_MAX, COUNT_MIN, formatUuid, generateUuids } from './logic';

const V4 = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('formatUuid', () => {
  it('lowercases with hyphens by default', () => {
    expect(formatUuid(V4)).toBe(V4);
  });

  it('uppercases when asked', () => {
    expect(formatUuid(V4, { uppercase: true })).toBe(V4.toUpperCase());
  });

  it('strips hyphens when asked', () => {
    expect(formatUuid(V4, { hyphens: false })).toBe(V4.replace(/-/g, ''));
  });

  it('combines uppercase and no-hyphens', () => {
    expect(formatUuid(V4, { uppercase: true, hyphens: false })).toBe(V4.replace(/-/g, '').toUpperCase());
  });
});

describe('clampCount', () => {
  it('clamps below the minimum', () => {
    expect(clampCount(0)).toBe(COUNT_MIN);
    expect(clampCount(-5)).toBe(COUNT_MIN);
  });

  it('clamps above the maximum', () => {
    expect(clampCount(1000)).toBe(COUNT_MAX);
  });

  it('floors fractional values', () => {
    expect(clampCount(5.9)).toBe(5);
  });

  it('falls back to the minimum for non-finite input', () => {
    expect(clampCount(NaN)).toBe(COUNT_MIN);
    expect(clampCount(Infinity)).toBe(COUNT_MIN);
  });
});

describe('generateUuids', () => {
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

  it('generates the requested count of valid v4 UUIDs', () => {
    const result = generateUuids(5);
    expect(result).toHaveLength(5);
    for (const id of result) expect(id).toMatch(UUID_RE);
  });

  it('produces unique values', () => {
    const result = generateUuids(50);
    expect(new Set(result).size).toBe(50);
  });

  it('applies formatting options to every entry', () => {
    const result = generateUuids(3, { uppercase: true, hyphens: false });
    for (const id of result) {
      expect(id).toBe(id.toUpperCase());
      expect(id).not.toContain('-');
    }
  });
});
