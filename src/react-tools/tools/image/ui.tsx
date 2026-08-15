import { useEffect, useId, useRef, useState } from 'react';
import { Download, Expand, ImagePlus, RotateCcw, Sparkles, X } from 'lucide-react';
import { Button, ButtonLink, ButtonRow } from '../../ui/Button';
import { formatBytes } from '../../lib/bytes';
import { useObjectUrl } from '../../lib/objectUrl';

type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';
interface ImageInfo { file: File; width: number; height: number; }
interface ResultInfo { blob: Blob; name: string; }

const PREVIEW = 'relative h-[220px] overflow-hidden rounded-[10px]! border border-line bg-surface-2 md:h-[360px]';
const PANE_FILE = 'min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-normal text-muted';

export function ImageTool() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<ImageInfo | null>(null);
  const [quality, setQuality] = useState(82);
  const [format, setFormat] = useState<OutputFormat>('image/webp');
  const [result, setResult] = useState<ResultInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lightbox, setLightbox] = useState<{ url: string; label: string } | null>(null);

  const imageUrl = useObjectUrl(image?.file);
  const resultUrl = useObjectUrl(result?.blob);

  useEffect(() => {
    if (!lightbox) return;
    const handler = (event: KeyboardEvent) => { if (event.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox]);

  const loadFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const probeUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(probeUrl);
      setImage({ file, width: img.naturalWidth, height: img.naturalHeight }); setResult(null);
    };
    img.src = probeUrl;
  };

  const processImage = () => {
    if (!image || !imageUrl) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width; canvas.height = image.height;
      const context = canvas.getContext('2d');
      if (!context) return;
      if (format === 'image/jpeg') { context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height); }
      context.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const extension = format.split('/')[1];
        setResult({ blob, name: `${image.file.name.replace(/\.[^.]+$/, '')}-liguang.${extension}` });
      }, format, quality / 100);
    };
    img.src = imageUrl;
  };

  const reset = () => {
    setImage(null); setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const smaller = result && image ? result.blob.size <= image.file.size : false;

  return (
    <div>
      {!image ? (
        <label
          htmlFor={inputId}
          onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => { event.preventDefault(); setIsDragging(false); loadFile(event.dataTransfer.files[0]); }}
          className={`group flex! min-h-[240px] cursor-pointer flex-col items-center justify-center gap-4 rounded-[14px] bg-paper px-6 py-12 text-center transition duration-150 ${
            isDragging
              ? 'border-2 border-solid border-accent bg-[color-mix(in_srgb,var(--color-accent)_7%,var(--color-paper))]'
              : 'border-2 border-dashed border-line hover:border-solid hover:border-accent hover:bg-[color-mix(in_srgb,var(--color-accent)_7%,var(--color-paper))]'
          }`}
        >
          <span className="grid size-14 shrink-0 place-items-center rounded-full! bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-accent transition duration-150 group-hover:scale-105">
            <ImagePlus size={26} />
          </span>
          <span className="flex flex-col items-center gap-1.5">
            <strong className="text-[15px] font-semibold text-ink">拖入一张图片，或点击选择</strong>
            <span className="text-[12.5px] text-muted">PNG / JPG / WEBP · 全程本地处理，图片不上传服务器</span>
          </span>
          <input ref={inputRef} id={inputId} type="file" accept="image/*" className="pointer-events-none absolute opacity-0"
            onChange={(event) => loadFile(event.target.files?.[0])} />
        </label>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex items-baseline gap-2.5 border-b border-line pb-2 text-[13px] font-semibold text-ink">
                <span className="shrink-0 text-[11px] font-semibold text-muted uppercase tracking-wide">原图</span>
                <span className={PANE_FILE} title={image.file.name}>
                  {image.file.name} · {image.width} × {image.height}px · {formatBytes(image.file.size)}
                </span>
              </div>
              <div className={`${PREVIEW} group cursor-zoom-in hover:border-accent`}
                onClick={() => imageUrl && setLightbox({ url: imageUrl, label: image.file.name })}>
                {imageUrl ? <img src={imageUrl} alt="原始图片预览" className="size-full object-contain" /> : null}
                <span className="absolute right-2 bottom-2 grid size-[26px] place-items-center rounded-full! bg-[color-mix(in_srgb,var(--color-ink)_78%,transparent)] text-paper opacity-0 transition duration-150 group-hover:opacity-100">
                  <Expand size={14} />
                </span>
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex items-baseline gap-2.5 border-b border-line pb-2 text-[13px] font-semibold text-ink">
                <span className="shrink-0 text-[11px] font-semibold text-muted uppercase tracking-wide">处理后</span>
                {result ? (
                  <span className={PANE_FILE} title={result.name}>{result.name} · {formatBytes(result.blob.size)}</span>
                ) : (
                  <span className={`${PANE_FILE} opacity-60`}>尚未处理</span>
                )}
                {result ? (
                  <b className={`shrink-0 normal-case ${smaller ? 'text-green' : 'text-accent'}`}>
                    {smaller ? `↓ ${Math.round((1 - result.blob.size / image.file.size) * 100)}%` : '体积变大'}
                  </b>
                ) : null}
              </div>
              {result && resultUrl ? (
                <div className={`${PREVIEW} group cursor-zoom-in hover:border-accent`}
                  onClick={() => setLightbox({ url: resultUrl, label: result.name })}>
                  <img src={resultUrl} alt="处理后图片预览" className="size-full object-contain" />
                  <span className="absolute right-2 bottom-2 grid size-[26px] place-items-center rounded-full! bg-[color-mix(in_srgb,var(--color-ink)_78%,transparent)] text-paper opacity-0 transition duration-150 group-hover:opacity-100">
                    <Expand size={14} />
                  </span>
                </div>
              ) : (
                <div className={`${PREVIEW} flex items-center justify-center border-dashed px-5 text-center text-[12.5px] text-muted`}>
                  <span>点击“开始处理”生成预览</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-4 md:gap-6">
            <label className="flex! shrink-0 grow-0 basis-auto flex-col gap-2 max-md:w-full">
              <span className="text-[12px] font-medium text-muted">输出格式</span>
              <select value={format} onChange={(event) => setFormat(event.target.value as OutputFormat)}
                className="h-[40px] w-full rounded-[10px]! border border-line bg-paper px-3 text-[13px] text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/5 md:w-[150px]">
                <option value="image/webp">WEBP</option><option value="image/jpeg">JPG</option><option value="image/png">PNG</option>
              </select>
            </label>
            <label className="flex! shrink-0 grow-0 basis-auto flex-col gap-2 max-md:w-full">
              <span className="text-[12px] font-medium text-muted">图像质量 <b className="float-right text-ink">{quality}%</b></span>
              <input type="range" min="10" max="100" value={quality} onChange={(event) => setQuality(Number(event.target.value))}
                className="mt-[5px] w-full accent-accent md:w-[200px]" />
            </label>
          </div>

          <ButtonRow>
            {result && resultUrl ? <ButtonLink href={resultUrl} download={result.name}><Download size={16} /> 下载</ButtonLink> : null}
            <Button onClick={reset}><RotateCcw size={16} /> 重选</Button>
            <Button variant="primary" onClick={processImage}><Sparkles size={17} /> 开始处理</Button>
          </ButtonRow>
        </>
      )}

      {lightbox ? (
        <div className="fixed inset-0 z-[200] flex cursor-zoom-out items-center justify-center bg-[rgba(20,18,14,.9)] p-10"
          onClick={() => setLightbox(null)}>
          <button type="button" aria-label="关闭预览" onClick={() => setLightbox(null)}
            className="absolute top-5 right-5 grid size-[38px] cursor-pointer place-items-center rounded-full! border border-white/30 bg-transparent text-white hover:bg-white/10">
            <X size={20} />
          </button>
          <img src={lightbox.url} alt={lightbox.label} onClick={(event) => event.stopPropagation()}
            className="max-h-full max-w-full cursor-default object-contain shadow-[0_20px_60px_rgba(0,0,0,.4)]" />
        </div>
      ) : null}
    </div>
  );
}
