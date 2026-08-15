import { describe, expect, it } from 'vitest';
import { contrastRatio, hslToRgb, parseHex, relativeLuminance, rgbToHex, rgbToHsl, wcagLevel } from './logic';

describe('parseHex', () => {
  it('parses a 6-digit hex with #', () => {
    expect(parseHex('#ff5733')).toEqual({ r: 255, g: 87, b: 51 });
  });

  it('parses a 6-digit hex without #', () => {
    expect(parseHex('ff5733')).toEqual({ r: 255, g: 87, b: 51 });
  });

  it('parses a 3-digit shorthand hex by doubling each digit', () => {
    expect(parseHex('#f53')).toEqual({ r: 255, g: 85, b: 51 });
  });

  it('is case-insensitive', () => {
    expect(parseHex('#FF5733')).toEqual({ r: 255, g: 87, b: 51 });
  });

  it('returns null for invalid input', () => {
    expect(parseHex('not-a-color')).toBeNull();
    expect(parseHex('#ff57')).toBeNull();
    expect(parseHex('')).toBeNull();
  });
});

describe('rgbToHex', () => {
  it('round-trips with parseHex', () => {
    expect(rgbToHex({ r: 255, g: 87, b: 51 })).toBe('#ff5733');
  });

  it('pads single-digit hex values', () => {
    expect(rgbToHex({ r: 0, g: 5, b: 255 })).toBe('#0005ff');
  });
});

describe('rgbToHsl / hslToRgb', () => {
  it('converts pure red', () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 });
  });

  it('converts pure white', () => {
    expect(rgbToHsl({ r: 255, g: 255, b: 255 })).toEqual({ h: 0, s: 0, l: 100 });
  });

  it('converts pure black', () => {
    expect(rgbToHsl({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, l: 0 });
  });

  it('round-trips HSL back to the original RGB for primary colors', () => {
    for (const rgb of [{ r: 255, g: 0, b: 0 }, { r: 0, g: 255, b: 0 }, { r: 0, g: 0, b: 255 }]) {
      expect(hslToRgb(rgbToHsl(rgb))).toEqual(rgb);
    }
  });

  it('converts the site accent color', () => {
    // #e4512e
    const rgb = { r: 228, g: 81, b: 46 };
    const hsl = rgbToHsl(rgb);
    const back = hslToRgb(hsl);
    // h/s/l are each rounded to whole degrees/percent (as any color picker
    // displays them), and those three independent roundings compound
    // non-linearly through the HSL->RGB conversion — a few units of
    // per-channel drift is expected, not a bug.
    expect(Math.abs(back.r - rgb.r)).toBeLessThanOrEqual(4);
    expect(Math.abs(back.g - rgb.g)).toBeLessThanOrEqual(4);
    expect(Math.abs(back.b - rgb.b)).toBeLessThanOrEqual(4);
  });
});

describe('relativeLuminance', () => {
  it('is 0 for black and 1 for white', () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 5);
  });
});

describe('contrastRatio', () => {
  it('is exactly 21 for black on white (the WCAG maximum)', () => {
    expect(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(21, 5);
  });

  it('is 1 for identical colors', () => {
    expect(contrastRatio({ r: 100, g: 150, b: 200 }, { r: 100, g: 150, b: 200 })).toBe(1);
  });

  it('is symmetric regardless of argument order', () => {
    const a = { r: 20, g: 30, b: 40 };
    const b = { r: 220, g: 210, b: 200 };
    expect(contrastRatio(a, b)).toBe(contrastRatio(b, a));
  });
});

describe('wcagLevel', () => {
  it('classifies black-on-white as AAA', () => {
    expect(wcagLevel(21)).toBe('AAA');
  });

  it('classifies a ratio just under 4.5 as Fail', () => {
    expect(wcagLevel(4.49)).toBe('Fail');
  });

  it('classifies a ratio between 4.5 and 7 as AA', () => {
    expect(wcagLevel(5)).toBe('AA');
  });

  it('classifies 1 (no contrast) as Fail', () => {
    expect(wcagLevel(1)).toBe('Fail');
  });
});
