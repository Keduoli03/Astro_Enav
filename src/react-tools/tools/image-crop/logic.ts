export interface Size {
  width: number;
  height: number;
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Handle = 'nw' | 'ne' | 'sw' | 'se';

export const ASPECT_PRESETS = [
  { id: 'free', label: '自由', ratio: null as number | null },
  { id: '1:1', label: '1:1', ratio: 1 },
  { id: '4:3', label: '4:3', ratio: 4 / 3 },
  { id: '3:2', label: '3:2', ratio: 3 / 2 },
  { id: '16:9', label: '16:9', ratio: 16 / 9 },
  { id: '9:16', label: '9:16', ratio: 9 / 16 },
] as const;

const MIN_SIZE = 4;

/** Keeps a rect's size within bounds and its position on-canvas. */
export function clampRect(rect: CropRect, bounds: Size): CropRect {
  const width = Math.min(Math.max(MIN_SIZE, rect.width), bounds.width);
  const height = Math.min(Math.max(MIN_SIZE, rect.height), bounds.height);
  const x = Math.min(Math.max(0, rect.x), bounds.width - width);
  const y = Math.min(Math.max(0, rect.y), bounds.height - height);
  return { x, y, width, height };
}

/** The largest rect with the given aspect ratio, centered within bounds. `null` ratio fills the bounds. */
export function centeredRectForRatio(bounds: Size, ratio: number | null): CropRect {
  if (!ratio) return { x: 0, y: 0, width: bounds.width, height: bounds.height };
  const boundsRatio = bounds.width / bounds.height;
  let width: number;
  let height: number;
  if (boundsRatio > ratio) {
    height = bounds.height;
    width = height * ratio;
  } else {
    width = bounds.width;
    height = width / ratio;
  }
  return clampRect({ x: (bounds.width - width) / 2, y: (bounds.height - height) / 2, width, height }, bounds);
}

export function moveRect(rect: CropRect, dx: number, dy: number, bounds: Size): CropRect {
  return clampRect({ ...rect, x: rect.x + dx, y: rect.y + dy }, bounds);
}

function anchorFor(rect: CropRect, handle: Handle) {
  switch (handle) {
    case 'nw': return { x: rect.x + rect.width, y: rect.y + rect.height };
    case 'ne': return { x: rect.x, y: rect.y + rect.height };
    case 'sw': return { x: rect.x + rect.width, y: rect.y };
    case 'se': return { x: rect.x, y: rect.y };
  }
}

function movingPoint(rect: CropRect, handle: Handle) {
  switch (handle) {
    case 'nw': return { x: rect.x, y: rect.y };
    case 'ne': return { x: rect.x + rect.width, y: rect.y };
    case 'sw': return { x: rect.x, y: rect.y + rect.height };
    case 'se': return { x: rect.x + rect.width, y: rect.y + rect.height };
  }
}

/**
 * Resizes `rect` by dragging `handle` by (dx, dy), keeping the opposite
 * corner fixed. When `ratio` is set, the resulting box is locked to it
 * (following whichever dimension moved further). Result is clamped to bounds.
 */
export function resizeRect(rect: CropRect, handle: Handle, dx: number, dy: number, bounds: Size, ratio: number | null): CropRect {
  const anchor = anchorFor(rect, handle);
  const moving = movingPoint(rect, handle);
  const mx = moving.x + dx;
  const my = moving.y + dy;

  let width = Math.max(MIN_SIZE, Math.abs(mx - anchor.x));
  let height = Math.max(MIN_SIZE, Math.abs(my - anchor.y));

  if (ratio) {
    if (width / ratio >= height) height = width / ratio;
    else width = height * ratio;
  }

  const x = mx >= anchor.x ? anchor.x : anchor.x - width;
  const y = my >= anchor.y ? anchor.y : anchor.y - height;

  return clampRect({ x, y, width, height }, bounds);
}
