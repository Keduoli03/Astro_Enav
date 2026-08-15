import { describe, expect, it } from 'vitest';
import {
  analyzeText,
  countChars,
  countCharsNoSpaces,
  countChineseCharacters,
  countLatinWords,
  countLines,
  countParagraphs,
  estimateReadingTime,
} from './logic';

describe('countChars', () => {
  it('counts every character including CJK', () => {
    expect(countChars('厘光 tools')).toBe(8);
  });

  it('counts a surrogate-pair emoji as one character', () => {
    expect(countChars('a😀b')).toBe(3);
  });

  it('returns 0 for empty input', () => {
    expect(countChars('')).toBe(0);
  });
});

describe('countCharsNoSpaces', () => {
  it('excludes all whitespace, including newlines', () => {
    expect(countCharsNoSpaces('a b\nc\td')).toBe(4);
  });
});

describe('countChineseCharacters', () => {
  it('counts only Han-script characters', () => {
    expect(countChineseCharacters('厘光 tools 工具集 123')).toBe(5);
  });

  it('returns 0 for pure Latin text', () => {
    expect(countChineseCharacters('hello world')).toBe(0);
  });
});

describe('countLatinWords', () => {
  it('counts space-separated Latin words', () => {
    expect(countLatinWords('hello world')).toBe(2);
  });

  it('treats hyphenated and apostrophized words as one word', () => {
    expect(countLatinWords("well-known don't")).toBe(2);
  });

  it('ignores Chinese characters and numbers', () => {
    expect(countLatinWords('厘光 123 tools')).toBe(1);
  });
});

describe('countLines', () => {
  it('counts newline-separated lines', () => {
    expect(countLines('a\nb\nc')).toBe(3);
  });

  it('returns 0 for empty input', () => {
    expect(countLines('')).toBe(0);
  });

  it('counts a single line with no newline as 1', () => {
    expect(countLines('a')).toBe(1);
  });
});

describe('countParagraphs', () => {
  it('splits on blank lines', () => {
    expect(countParagraphs('para one\n\npara two\n\npara three')).toBe(3);
  });

  it('collapses multiple blank lines between paragraphs', () => {
    expect(countParagraphs('a\n\n\n\nb')).toBe(2);
  });

  it('returns 0 for empty or whitespace-only input', () => {
    expect(countParagraphs('')).toBe(0);
    expect(countParagraphs('   \n  ')).toBe(0);
  });
});

describe('estimateReadingTime', () => {
  it('returns zero for empty input', () => {
    expect(estimateReadingTime('')).toEqual({ minutes: 0, seconds: 0 });
  });

  it('rounds up to at least 1 minute and 15 seconds for any non-empty text', () => {
    const result = estimateReadingTime('a');
    expect(result.minutes).toBeGreaterThanOrEqual(1);
    expect(result.seconds).toBeGreaterThanOrEqual(15);
  });

  it('scales up for longer text', () => {
    const short = estimateReadingTime('hello world');
    const long = estimateReadingTime('word '.repeat(1000));
    expect(long.seconds).toBeGreaterThan(short.seconds);
  });
});

describe('analyzeText', () => {
  it('aggregates all metrics consistently', () => {
    const stats = analyzeText('厘光 tools\n\n第二段 second paragraph');
    expect(stats.chars).toBe(countChars('厘光 tools\n\n第二段 second paragraph'));
    expect(stats.chineseCharacters).toBe(5);
    expect(stats.latinWords).toBe(3);
    expect(stats.paragraphs).toBe(2);
    expect(stats.lines).toBe(3);
  });
});
