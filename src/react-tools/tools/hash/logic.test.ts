import { describe, expect, it } from 'vitest';
import { HASH_ALGORITHMS, hashBlob, hashText, hashTextAll } from './logic';

// Known-answer vectors (NIST / RFC test vectors).
describe('hashText', () => {
  it('matches the SHA-1 vector for an empty string', async () => {
    expect(await hashText('', 'SHA-1')).toBe('da39a3ee5e6b4b0d3255bfef95601890afd80709');
  });

  it('matches the SHA-256 vector for an empty string', async () => {
    expect(await hashText('', 'SHA-256')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('matches the SHA-1 vector for "abc"', async () => {
    expect(await hashText('abc', 'SHA-1')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
  });

  it('matches the SHA-256 vector for "abc"', async () => {
    expect(await hashText('abc', 'SHA-256')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('matches the SHA-512 vector for "abc"', async () => {
    expect(await hashText('abc', 'SHA-512')).toBe(
      'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
    );
  });

  it('produces a different digest for different input', async () => {
    expect(await hashText('a', 'SHA-256')).not.toBe(await hashText('b', 'SHA-256'));
  });
});

describe('hashTextAll', () => {
  it('computes every algorithm and matches individual calls', async () => {
    const all = await hashTextAll('厘光');
    for (const algorithm of HASH_ALGORITHMS) {
      expect(all[algorithm]).toBe(await hashText('厘光', algorithm));
    }
  });
});

describe('hashBlob', () => {
  it('hashes a Blob the same as the equivalent text', async () => {
    const blob = new Blob(['abc']);
    expect(await hashBlob(blob, 'SHA-256')).toBe(await hashText('abc', 'SHA-256'));
  });
});
