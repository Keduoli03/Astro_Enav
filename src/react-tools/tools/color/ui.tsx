import { useMemo, useState } from 'react';
import { CopyButton } from '../../ui/CopyButton';
import { contrastRatio, hslToRgb, parseHex, relativeLuminance, rgbToHex, rgbToHsl, wcagLevel, type Rgb } from './logic';

const SWATCHES = ['#e4512e', '#27775d', '#4e7085', '#a35c12', '#d95735', '#1d211e'];

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line px-3.5 py-3 text-[13px] last:border-b-0">
      <span className="text-muted">{label}</span>
      <span className="flex min-w-0 items-center gap-2 font-mono text-ink">{value}<CopyButton value={value} /></span>
    </div>
  );
}

export function ColorTool() {
  const [hexInput, setHexInput] = useState('#e4512e');
  const [bgInput, setBgInput] = useState('#f1efe8');

  const rgb = useMemo<Rgb | null>(() => parseHex(hexInput), [hexInput]);
  const bg = useMemo<Rgb | null>(() => parseHex(bgInput), [bgInput]);
  const hsl = rgb ? rgbToHsl(rgb) : null;

  const ratio = rgb && bg ? contrastRatio(rgb, bg) : null;
  const level = ratio !== null ? wcagLevel(ratio) : null;

  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {SWATCHES.map((swatch) => (
          <button
            key={swatch}
            type="button"
            onClick={() => setHexInput(swatch)}
            title={swatch}
            aria-label={`使用 ${swatch}`}
            className="size-9 cursor-pointer rounded-full! border border-line transition duration-150 hover:scale-110"
            style={{ backgroundColor: swatch }}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-4">
        <label className="flex! flex-col gap-2">
          <span className="text-[12px] font-medium text-muted">HEX 颜色</span>
          <div className="flex items-center gap-2">
            <input type="color" value={rgb ? rgbToHex(rgb) : '#000000'} onChange={(event) => setHexInput(event.target.value)}
              className="size-[40px] cursor-pointer rounded-[9px]! border border-line bg-paper p-0.5" />
            <input value={hexInput} onChange={(event) => setHexInput(event.target.value)} placeholder="#e4512e"
              className="h-[40px] w-[150px] rounded-[10px]! border border-line bg-paper px-3 font-mono text-[13px] text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/5" />
          </div>
        </label>
      </div>

      {!rgb ? (
        <p className="mt-3.5 rounded-[9px]! bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] px-3 py-2.5 text-[12px] text-accent">
          不是有效的 HEX 颜色，请输入例如 #e4512e 或 #e45
        </p>
      ) : (
        <div className="mt-5 overflow-hidden rounded-[10px]! border border-line">
          <div className="flex h-16 items-center justify-center border-b border-line font-mono text-[13px] font-medium text-white [text-shadow:0_1px_2px_rgb(0_0_0_/_0.4)]" style={{ backgroundColor: rgbToHex(rgb) }}>
            {rgbToHex(rgb)}
          </div>
          <Field label="HEX" value={rgbToHex(rgb)} />
          <Field label="RGB" value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />
          {hsl ? <Field label="HSL" value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} /> : null}
          <Field label="相对亮度" value={relativeLuminance(rgb).toFixed(3)} />
        </div>
      )}

      <section className="mt-7">
        <h3 className="mb-2.5 text-[14px] font-semibold text-ink">对比度无障碍检查</h3>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex! flex-col gap-2">
            <span className="text-[12px] font-medium text-muted">背景色</span>
            <div className="flex items-center gap-2">
              <input type="color" value={bg ? rgbToHex(bg) : '#ffffff'} onChange={(event) => setBgInput(event.target.value)}
                className="size-[40px] cursor-pointer rounded-[9px]! border border-line bg-paper p-0.5" />
              <input value={bgInput} onChange={(event) => setBgInput(event.target.value)} placeholder="#f1efe8"
                className="h-[40px] w-[150px] rounded-[10px]! border border-line bg-paper px-3 font-mono text-[13px] text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/5" />
            </div>
          </label>
        </div>

        {rgb && bg ? (
          <div className="mt-3.5 flex flex-wrap items-center gap-4 rounded-[10px]! border border-line px-4 py-3.5">
            <div
              className="flex h-14 flex-1 min-w-[170px] items-center justify-center rounded-[10px]! font-semibold text-sm"
              style={{ backgroundColor: rgbToHex(bg), color: rgbToHex(rgb) }}
            >
              示例文字 Sample Text
            </div>
            <div className="text-[13px]">
              <div className="font-mono text-2xl text-ink">{ratio?.toFixed(2)}<span className="text-sm text-muted">:1</span></div>
              <div
                className={`mt-1 inline-block rounded-[7px]! px-2 py-0.5 text-[11px] font-bold ${
                  level === 'Fail' ? 'bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-accent' : 'bg-[color-mix(in_srgb,var(--color-green)_14%,transparent)] text-green'
                }`}
              >
                {level === 'Fail' ? '不达标' : `WCAG ${level}`}
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
