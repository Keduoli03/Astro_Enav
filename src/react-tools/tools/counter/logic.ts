export function normalize(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/** Counts by code point (not UTF-16 code unit), so surrogate pairs count once. */
export function countChars(text: string): number {
  return [...normalize(text)].length;
}

export function countCharsNoSpaces(text: string): number {
  return [...normalize(text).replace(/\s/g, '')].length;
}

export function countChineseCharacters(text: string): number {
  return (normalize(text).match(/\p{Script=Han}/gu) || []).length;
}

export function countLatinWords(text: string): number {
  return (normalize(text).match(/[A-Za-z]+(?:['-][A-Za-z]+)*/g) || []).length;
}

export function countLines(text: string): number {
  const normalized = normalize(text);
  return normalized ? normalized.split('\n').length : 0;
}

export function countParagraphs(text: string): number {
  const trimmed = normalize(text).trim();
  if (!trimmed) return 0;
  return trimmed.split(/\n\s*\n/).filter((paragraph) => paragraph.trim()).length;
}

export interface ReadingTime {
  minutes: number;
  seconds: number;
}

/** Rough estimate: 300 CJK chars/min, 200 Latin words/min, read concurrently. */
export function estimateReadingTime(text: string): ReadingTime {
  if (!normalize(text).trim()) return { minutes: 0, seconds: 0 };
  const chinese = countChineseCharacters(text);
  const words = countLatinWords(text);
  const minutesFloat = chinese / 300 + words / 200;
  return {
    minutes: Math.max(1, Math.ceil(minutesFloat)),
    seconds: Math.max(15, Math.round(minutesFloat * 60)),
  };
}

export interface TextStats {
  chars: number;
  charsNoSpaces: number;
  chineseCharacters: number;
  latinWords: number;
  lines: number;
  paragraphs: number;
  readingTime: ReadingTime;
}

export function analyzeText(text: string): TextStats {
  return {
    chars: countChars(text),
    charsNoSpaces: countCharsNoSpaces(text),
    chineseCharacters: countChineseCharacters(text),
    latinWords: countLatinWords(text),
    lines: countLines(text),
    paragraphs: countParagraphs(text),
    readingTime: estimateReadingTime(text),
  };
}
