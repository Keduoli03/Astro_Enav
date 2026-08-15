export const HASH_ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;
export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number];

export function bufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function hashText(text: string, algorithm: HashAlgorithm): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest(algorithm, data);
  return bufferToHex(digest);
}

export async function hashBlob(blob: Blob, algorithm: HashAlgorithm): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest(algorithm, buffer);
  return bufferToHex(digest);
}

/** Computes every supported algorithm for the same input text in parallel. */
export async function hashTextAll(text: string): Promise<Record<HashAlgorithm, string>> {
  const entries = await Promise.all(HASH_ALGORITHMS.map(async (algorithm) => [algorithm, await hashText(text, algorithm)] as const));
  return Object.fromEntries(entries) as Record<HashAlgorithm, string>;
}

export async function hashBlobAll(blob: Blob): Promise<Record<HashAlgorithm, string>> {
  const entries = await Promise.all(HASH_ALGORITHMS.map(async (algorithm) => [algorithm, await hashBlob(blob, algorithm)] as const));
  return Object.fromEntries(entries) as Record<HashAlgorithm, string>;
}
