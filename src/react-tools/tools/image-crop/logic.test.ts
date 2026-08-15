import { describe, expect, it } from 'vitest';
import { ASPECT_PRESETS, centeredRectForRatio, clampRect, moveRect, resizeRect } from './logic';

const BOUNDS = { width: 1000, height: 800 };

describe('clampRect', () => {
  it('pulls an out-of-bounds rect back inside the canvas', () => {
    expect(clampRect({ x: 900, y: 900, width: 200, height: 200 }, BOUNDS)).toEqual({ x: 800, y: 600, width: 200, height: 200 });
  });

  it('leaves an in-bounds rect untouched', () => {
    const rect = { x: 10, y: 20, width: 100, height: 100 };
    expect(clampRect(rect, BOUNDS)).toEqual(rect);
  });

  it('never shrinks below the minimum size', () => {
    const result = clampRect({ x: 0, y: 0, width: 0, height: -5 }, BOUNDS);
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });
});

describe('centeredRectForRatio', () => {
  it('fills the bounds when ratio is null (free)', () => {
    expect(centeredRectForRatio(BOUNDS, null)).toEqual({ x: 0, y: 0, width: 1000, height: 800 });
  });

  it('fits a square inside wide bounds, centered horizontally', () => {
    expect(centeredRectForRatio(BOUNDS, 1)).toEqual({ x: 100, y: 0, width: 800, height: 800 });
  });

  it('fits a wide ratio inside tall bounds, centered vertically', () => {
    expect(centeredRectForRatio({ width: 400, height: 800 }, 16 / 9)).toEqual({ x: 0, y: 287.5, width: 400, height: 225 });
  });

  it('every preset ratio produces a rect within bounds', () => {
    for (const preset of ASPECT_PRESETS) {
      const rect = centeredRectForRatio(BOUNDS, preset.ratio);
      expect(rect.x).toBeGreaterThanOrEqual(0);
      expect(rect.y).toBeGreaterThanOrEqual(0);
      expect(rect.x + rect.width).toBeLessThanOrEqual(BOUNDS.width + 0.001);
      expect(rect.y + rect.height).toBeLessThanOrEqual(BOUNDS.height + 0.001);
    }
  });
});

describe('moveRect', () => {
  it('translates by dx/dy within bounds', () => {
    expect(moveRect({ x: 10, y: 10, width: 100, height: 100 }, 5, 5, BOUNDS)).toEqual({ x: 15, y: 15, width: 100, height: 100 });
  });

  it('clamps at the canvas edge instead of going negative', () => {
    expect(moveRect({ x: 10, y: 10, width: 100, height: 100 }, -50, -50, BOUNDS)).toEqual({ x: 0, y: 0, width: 100, height: 100 });
  });
});

describe('resizeRect', () => {
  const rect = { x: 100, y: 100, width: 200, height: 150 };

  it('dragging the se handle outward grows the box from the nw corner', () => {
    expect(resizeRect(rect, 'se', 50, 30, BOUNDS, null)).toEqual({ x: 100, y: 100, width: 250, height: 180 });
  });

  it('dragging the nw handle outward grows the box from the se corner', () => {
    expect(resizeRect(rect, 'nw', -50, -30, BOUNDS, null)).toEqual({ x: 50, y: 70, width: 250, height: 180 });
  });

  it('locks to the given aspect ratio, following the larger implied dimension', () => {
    const result = resizeRect(rect, 'se', 80, 20, BOUNDS, 1);
    expect(result).toEqual({ x: 100, y: 100, width: 280, height: 280 });
    expect(result.width / result.height).toBe(1);
  });

  it('clamps the result when dragged past the canvas edge', () => {
    const result = resizeRect({ x: 900, y: 700, width: 50, height: 50 }, 'se', 500, 500, BOUNDS, null);
    expect(result.x + result.width).toBeLessThanOrEqual(BOUNDS.width);
    expect(result.y + result.height).toBeLessThanOrEqual(BOUNDS.height);
  });

  it('keeps the opposite corner fixed regardless of handle', () => {
    // se anchor is the nw corner; that corner must not move.
    const result = resizeRect(rect, 'se', 10, 10, BOUNDS, null);
    expect(result.x).toBe(rect.x);
    expect(result.y).toBe(rect.y);
  });
});
