import { useId, useRef, useState } from 'react';
import { Crop, Download, ImagePlus, RotateCcw } from 'lucide-react';
import { Button, ButtonLink, ButtonRow } from '../../ui/Button';
import { formatBytes } from '../../lib/bytes';
import { useObjectUrl } from '../../lib/objectUrl';
import { ASPECT_PRESETS, centeredRectForRatio, moveRect, resizeRect, type CropRect, type Handle } from './logic';

interface ImageInfo { file: File; width: number; height: number; }
interface ResultInfo { blob: Blob; name: string; }

const HANDLES: Handle[] = ['nw', 'ne', 'sw', 'se'];
const HANDLE_CURSOR: Record<Handle, string> = { nw: 'cursor-nwse-resize', se: 'cursor-nwse-resize', ne: 'cursor-nesw-resize', sw: 'cursor-nesw-resize' };
const HANDLE_POS: Record<Handle, string> = {
  nw: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
  ne: 'top-0 right-0 translate-x-1/2 -translate-y-1/2',
  sw: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
  se: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
};

export function ImageCropTool() {
  const inputId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<ImageInfo | null>(null);
  const [rect, setRect] = useState<CropRect | null>(null);
  const [presetId, setPresetId] = useState<(typeof ASPECT_PRESETS)[number]['id']>('free');
  const [result, setResult] = useState<ResultInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const imageUrl = useObjectUrl(image?.file);
  const resultUrl = useObjectUrl(result?.blob);

  const loadFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const probeUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(probeUrl);
      const bounds = { width: img.naturalWidth, height: img.naturalHeight };
      setImage({ file, ...bounds });
      setRect(centeredRectForRatio(bounds, ASPECT_PRESETS.find((p) => p.id === 'free')!.ratio));
      setPresetId('free');
      setResult(null);
    };
    img.src = probeUrl;
  };

  const applyPreset = (id: (typeof ASPECT_PRESETS)[number]['id']) => {
    if (!image) return;
    setPresetId(id);
    const preset = ASPECT_PRESETS.find((p) => p.id === id)!;
    setRect(centeredRectForRatio({ width: image.width, height: image.height }, preset.ratio));
  };

  const withPointerDrag = (onMove: (dx: number, dy: number) => void) => (startEvent: React.PointerEvent) => {
    startEvent.preventDefault();
    if (!stageRef.current || !image) return;
    // Read the scale fresh at drag-start: the stage only exists once the
    // async object-URL preview has loaded, so a mount-time effect can miss it.
    const scale = image.width / stageRef.current.getBoundingClientRect().width;
    setIsDragging(true);
    const startX = startEvent.clientX;
    const startY = startEvent.clientY;
    const handleMove = (event: PointerEvent) => {
      onMove((event.clientX - startX) * scale, (event.clientY - startY) * scale);
    };
    const handleUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  const startMove = (base: CropRect) => withPointerDrag((dx, dy) => {
    if (!image) return;
    setRect(moveRect(base, dx, dy, { width: image.width, height: image.height }));
  });

  const startResize = (base: CropRect, handle: Handle) => withPointerDrag((dx, dy) => {
    if (!image) return;
    const ratio = ASPECT_PRESETS.find((p) => p.id === presetId)!.ratio;
    setRect(resizeRect(base, handle, dx, dy, { width: image.width, height: image.height }, ratio));
  });

  const exportCrop = async () => {
    if (!image || !rect || !imageUrl) return;
    const img = new Image();
    await new Promise<void>((resolve) => { img.onload = () => resolve(); img.src = imageUrl; });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(rect.width);
    canvas.height = Math.round(rect.height);
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(img, rect.x, rect.y, rect.width, rect.height, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      setResult({ blob, name: `${image.file.name.replace(/\.[^.]+$/, '')}-crop.png` });
    }, 'image/png');
  };

  const reset = () => { setImage(null); setRect(null); setResult(null); };

  return (
    <div>
      {!image ? (
        <label
          htmlFor={inputId}
          onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => { event.preventDefault(); setIsDragging(false); loadFile(event.dataTransfer.files[0]); }}
          className={`flex! min-h-[240px] cursor-pointer flex-col items-center justify-center gap-4 rounded-[14px] bg-paper px-6 py-12 text-center transition duration-150 ${
            isDragging
              ? 'border-2 border-solid border-accent bg-[color-mix(in_srgb,var(--color-accent)_7%,var(--color-paper))]'
              : 'border-2 border-dashed border-line hover:border-solid hover:border-accent hover:bg-[color-mix(in_srgb,var(--color-accent)_7%,var(--color-paper))]'
          }`}
        >
          <span className="grid size-14 shrink-0 place-items-center rounded-full! bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-accent">
            <ImagePlus size={26} />
          </span>
          <span className="flex flex-col items-center gap-1.5">
            <strong className="text-[15px] font-semibold text-ink">拖入一张图片，或点击选择</strong>
            <span className="text-[12.5px] text-muted">支持自由裁剪与 1:1、4:3、16:9 等常用比例</span>
          </span>
          <input id={inputId} type="file" accept="image/*" className="pointer-events-none absolute opacity-0"
            onChange={(event) => loadFile(event.target.files?.[0])} />
        </label>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-1.5">
            {ASPECT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={`h-[32px] cursor-pointer rounded-[8px]! border px-3 font-mono text-[12px] transition duration-150 ${
                  presetId === preset.id ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface text-muted hover:border-ink/40 hover:text-ink'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {imageUrl && rect ? (
            <div ref={stageRef} className={`relative mt-3.5 w-full touch-none select-none ${isDragging ? 'cursor-grabbing' : ''}`}
              style={{ aspectRatio: `${image.width} / ${image.height}` }}>
              <img src={imageUrl} alt="待裁剪图片" className="pointer-events-none size-full object-contain" draggable={false} />
              <div
                className="absolute cursor-move border-2 border-accent bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)]"
                style={{
                  left: `${(rect.x / image.width) * 100}%`,
                  top: `${(rect.y / image.height) * 100}%`,
                  width: `${(rect.width / image.width) * 100}%`,
                  height: `${(rect.height / image.height) * 100}%`,
                }}
                onPointerDown={startMove(rect)}
              >
                {HANDLES.map((handle) => (
                  <span
                    key={handle}
                    onPointerDown={(event) => { event.stopPropagation(); startResize(rect, handle)(event); }}
                    className={`absolute size-3.5 rounded-full! border-2 border-accent bg-paper ${HANDLE_POS[handle]} ${HANDLE_CURSOR[handle]}`}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <p className="mt-2.5 font-mono text-[12px] text-muted">
            {rect ? `${Math.round(rect.width)} × ${Math.round(rect.height)}px` : ''} · 拖动方框移动，拖动圆点调整大小
          </p>

          {result && resultUrl ? (
            <div className="mt-4 flex items-center gap-3 rounded-[10px]! border border-line p-3">
              <img src={resultUrl} alt="裁剪结果" className="h-16 w-16 shrink-0 rounded-[8px]! border border-line bg-surface-2 object-contain" />
              <div className="min-w-0 flex-1 text-[13px]">
                <div className="truncate font-medium text-ink">{result.name}</div>
                <div className="mt-0.5 text-[12px] text-muted">{formatBytes(result.blob.size)}</div>
              </div>
              <ButtonLink href={resultUrl} download={result.name}><Download size={16} /> 下载</ButtonLink>
            </div>
          ) : null}

          <ButtonRow>
            <Button onClick={reset}><RotateCcw size={16} /> 重选</Button>
            <Button variant="primary" onClick={exportCrop}><Crop size={16} /> 裁剪并导出</Button>
          </ButtonRow>
        </>
      )}
    </div>
  );
}
