import { describe, expect, it } from 'vitest';
import { decodeValue, encodeValue, parseQueryParams } from './logic';

describe('encodeValue', () => {
  it('component mode escapes reserved query characters', () => {
    expect(encodeValue('a b&c=d', 'component')).toBe('a%20b%26c%3Dd');
  });

  it('full mode leaves URL structure characters untouched', () => {
    expect(encodeValue('https://a.com/x y?a=b&c=d', 'full')).toBe('https://a.com/x%20y?a=b&c=d');
  });

  it('encodes non-ASCII text', () => {
    expect(encodeValue('厘光', 'component')).toBe('%E5%8E%98%E5%85%89');
  });
});

describe('decodeValue', () => {
  it('round-trips an encoded component', () => {
    const encoded = encodeValue('a b&c=d', 'component');
    expect(decodeValue(encoded, 'component')).toEqual({ ok: true, value: 'a b&c=d' });
  });

  it('round-trips an encoded full URL', () => {
    const encoded = encodeValue('https://a.com/x y?a=b', 'full');
    expect(decodeValue(encoded, 'full')).toEqual({ ok: true, value: 'https://a.com/x y?a=b' });
  });

  it('reports a failure for malformed percent-encoding instead of throwing', () => {
    const result = decodeValue('%E5%8E', 'component');
    expect(result.ok).toBe(false);
  });
});

describe('parseQueryParams', () => {
  it('parses params from a full URL', () => {
    expect(parseQueryParams('https://a.com/path?a=1&b=2')).toEqual([
      { key: 'a', value: '1' },
      { key: 'b', value: '2' },
    ]);
  });

  it('parses a bare query string with a leading ?', () => {
    expect(parseQueryParams('?a=1&b=2')).toEqual([
      { key: 'a', value: '1' },
      { key: 'b', value: '2' },
    ]);
  });

  it('parses a bare query string without a leading ?', () => {
    expect(parseQueryParams('a=1&b=2')).toEqual([
      { key: 'a', value: '1' },
      { key: 'b', value: '2' },
    ]);
  });

  it('returns an empty array for empty input', () => {
    expect(parseQueryParams('')).toEqual([]);
    expect(parseQueryParams('   ')).toEqual([]);
  });

  it('returns an empty array for a URL with no query string', () => {
    expect(parseQueryParams('https://a.com/path')).toEqual([]);
  });

  it('preserves duplicate keys as separate entries', () => {
    expect(parseQueryParams('tag=a&tag=b')).toEqual([
      { key: 'tag', value: 'a' },
      { key: 'tag', value: 'b' },
    ]);
  });

  it('decodes percent-encoded values', () => {
    expect(parseQueryParams('q=%E5%8E%98%E5%85%89')).toEqual([{ key: 'q', value: '厘光' }]);
  });
});
