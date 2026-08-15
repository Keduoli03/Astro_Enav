export function trimLines(text: string): string {
  return text.split('\n').map((line) => line.trim()).join('\n');
}

/** Collapses runs of two or more blank lines down to a single, truly-empty line. */
export function collapseBlankLines(text: string): string {
  const out: string[] = [];
  let previousWasBlank = false;
  for (const line of text.split('\n')) {
    const isBlank = line.trim() === '';
    if (isBlank && previousWasBlank) continue;
    out.push(isBlank ? '' : line);
    previousWasBlank = isBlank;
  }
  return out.join('\n');
}

/** Removes repeated lines, keeping the first occurrence's position. */
export function dedupeLines(text: string): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of text.split('\n')) {
    if (seen.has(line)) continue;
    seen.add(line);
    out.push(line);
  }
  return out.join('\n');
}

// Zero-width space (U+200B), ZWNJ (U+200C), ZWJ (U+200D), BOM (U+FEFF),
// word joiner (U+2060), soft hyphen (U+00AD).
const INVISIBLE_RE = /[​-‍﻿⁠­]/g;

export function stripInvisible(text: string): string {
  return text.replace(INVISIBLE_RE, '');
}

export function toHalfWidth(text: string): string {
  return text
    .replace(/[！-～]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/　/g, ' ');
}

export function toFullWidth(text: string): string {
  return text
    .replace(/[!-~]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 0xfee0))
    .replace(/ /g, '　');
}

export type WidthMode = 'none' | 'toHalf' | 'toFull';

export interface CleanOptions {
  stripInvisible?: boolean;
  width?: WidthMode;
  trimLines?: boolean;
  collapseBlankLines?: boolean;
  dedupeLines?: boolean;
}

export function cleanText(text: string, options: CleanOptions): string {
  let result = text;
  if (options.stripInvisible) result = stripInvisible(result);
  if (options.width === 'toHalf') result = toHalfWidth(result);
  else if (options.width === 'toFull') result = toFullWidth(result);
  if (options.trimLines) result = trimLines(result);
  if (options.collapseBlankLines) result = collapseBlankLines(result);
  if (options.dedupeLines) result = dedupeLines(result);
  return result;
}
