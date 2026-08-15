import { describe, expect, it } from 'vitest';
import { cleanText, collapseBlankLines, dedupeLines, stripInvisible, toFullWidth, toHalfWidth, trimLines } from './logic';

describe('trimLines', () => {
  it('trims leading and trailing whitespace on every line', () => {
    expect(trimLines('  a  \n b \n  c')).toBe('a\nb\nc');
  });
});

describe('collapseBlankLines', () => {
  it('collapses runs of blank lines to one', () => {
    expect(collapseBlankLines('a\n\n\n\nb')).toBe('a\n\nb');
  });

  it('leaves single blank lines untouched', () => {
    expect(collapseBlankLines('a\n\nb')).toBe('a\n\nb');
  });

  it('treats whitespace-only lines as blank', () => {
    expect(collapseBlankLines('a\n   \n\t\nb')).toBe('a\n\nb');
  });
});

describe('dedupeLines', () => {
  it('removes repeated lines, keeping first occurrence order', () => {
    expect(dedupeLines('a\nb\na\nc\nb')).toBe('a\nb\nc');
  });

  it('is a no-op with no duplicates', () => {
    expect(dedupeLines('a\nb\nc')).toBe('a\nb\nc');
  });
});

describe('stripInvisible', () => {
  it('removes zero-width space, ZWNJ, ZWJ, BOM, word joiner, soft hyphen', () => {
    const dirty = 'a' + '​' + 'b' + '‌' + 'c' + '‍' + 'd' + '﻿' + 'e' + '⁠' + 'f' + '­' + 'g';
    expect(stripInvisible(dirty)).toBe('abcdefg');
  });

  it('leaves normal text untouched', () => {
    expect(stripInvisible('厘光工具集')).toBe('厘光工具集');
  });
});

describe('toHalfWidth', () => {
  it('converts full-width ASCII letters and digits', () => {
    expect(toHalfWidth('ＡＢＣ１２３')).toBe('ABC123');
  });

  it('converts the full-width space', () => {
    expect(toHalfWidth('a　b')).toBe('a b');
  });

  it('leaves CJK characters untouched', () => {
    expect(toHalfWidth('厘光')).toBe('厘光');
  });
});

describe('toFullWidth', () => {
  it('converts ASCII letters and digits to full-width', () => {
    expect(toFullWidth('ABC123')).toBe('ＡＢＣ１２３');
  });

  it('converts spaces to the full-width space (letters convert too)', () => {
    expect(toFullWidth('a b')).toBe('ａ　ｂ');
  });

  it('round-trips with toHalfWidth', () => {
    expect(toHalfWidth(toFullWidth('Hello 123'))).toBe('Hello 123');
  });
});

describe('cleanText', () => {
  it('applies only the requested operations', () => {
    expect(cleanText('  a  \n\n\n  b  ', { trimLines: true })).toBe('a\n\n\nb');
  });

  it('applies operations in a sensible fixed order (trim before collapse)', () => {
    // Lines with only whitespace become blank after trimming, and should
    // then collapse — this only works if trim runs before collapse.
    expect(cleanText('a\n   \n\n b', { trimLines: true, collapseBlankLines: true })).toBe('a\n\nb');
  });

  it('combines width conversion with trimming', () => {
    expect(cleanText('  ＡＢＣ  ', { width: 'toHalf', trimLines: true })).toBe('ABC');
  });

  it('is a no-op with no options set', () => {
    expect(cleanText('  a  ', {})).toBe('  a  ');
  });
});
