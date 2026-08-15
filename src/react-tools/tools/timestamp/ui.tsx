import { useEffect, useState } from 'react';
import { Clock3, RefreshCw } from 'lucide-react';
import { Button } from '../../ui/Button';
import { CopyButton } from '../../ui/CopyButton';
import { COMMON_ZONES, detectUnit, formatInZone, parseLocalDateTime, parseTimestampInput, toUnixSeconds } from './logic';

function nowLocalInputValue() {
  const date = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function TimestampTool() {
  const [now, setNow] = useState(() => Date.now());
  const [input, setInput] = useState(() => String(Math.floor(Date.now() / 1000)));
  const [localValue, setLocalValue] = useState(nowLocalInputValue);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const parsed = parseTimestampInput(input);
  const unit = input.trim() ? detectUnit(input) : null;
  const targetMs = parseLocalDateTime(localValue);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px]! border border-line bg-surface-2 px-4 py-3.5">
        <div className="flex items-center gap-2 text-[12px] font-medium text-muted"><Clock3 size={16} /> 当前时间戳</div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[14px] text-ink">
          <span className="flex items-center gap-1.5">{Math.floor(now / 1000)}<CopyButton value={String(Math.floor(now / 1000))} label="秒" copiedLabel="✓" /></span>
          <span className="flex items-center gap-1.5">{now}<CopyButton value={String(now)} label="毫秒" copiedLabel="✓" /></span>
        </div>
      </div>

      <section className="mt-6">
        <h3 className="mb-2.5 text-[14px] font-semibold text-ink">时间戳 → 日期</h3>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex! min-w-0 flex-1 flex-col gap-2">
            <span className="text-[12px] font-medium text-muted">输入时间戳（自动识别秒 / 毫秒）</span>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="例如 1700000000 或 1700000000000"
              className="h-[40px] w-full rounded-[10px]! border border-line bg-paper px-3 font-mono text-[13px] text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/5"
            />
          </label>
          <Button onClick={() => setInput(String(Math.floor(Date.now() / 1000)))}><RefreshCw size={16} /> 现在</Button>
        </div>
        {input.trim() && !parsed ? (
          <p className="mt-2.5 rounded-[9px]! bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] px-3 py-2.5 text-[12px] text-accent">
            不是有效的整数时间戳
          </p>
        ) : null}
        {parsed ? (
          <div className="mt-3.5 overflow-hidden rounded-[10px]! border border-line">
            <div className="flex items-center justify-between border-b border-line bg-surface-2 px-3.5 py-2.5 text-[12px] text-muted">
              <span>识别为{unit === 'seconds' ? '秒级' : '毫秒级'}时间戳</span>
              <span className="font-mono">Unix: {toUnixSeconds(parsed.ms)}</span>
            </div>
            {COMMON_ZONES.map((zone) => {
              const formatted = formatInZone(parsed.ms, zone.id);
              return (
                <div key={zone.id} className="flex items-center justify-between gap-2 border-b border-line px-3.5 py-2.5 text-[13px] last:border-b-0">
                  <span className="text-muted">{zone.label}</span>
                  <span className="flex items-center gap-2 font-mono text-ink">
                    {formatted ?? '—'}
                    {formatted ? <CopyButton value={formatted} /> : null}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}
      </section>

      <section className="mt-7">
        <h3 className="mb-2.5 text-[14px] font-semibold text-ink">日期 → 时间戳</h3>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex! flex-col gap-2">
            <span className="text-[12px] font-medium text-muted">选择本地日期时间</span>
            <input
              type="datetime-local"
              value={localValue}
              onChange={(event) => setLocalValue(event.target.value)}
              className="h-[40px] rounded-[10px]! border border-line bg-paper px-3 text-[13px] text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/5"
            />
          </label>
        </div>
        {targetMs !== null ? (
          <div className="mt-3.5 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-[10px]! border border-line px-3.5 py-2.5 font-mono text-[13px] text-ink">
              秒：{toUnixSeconds(targetMs)}<CopyButton value={String(toUnixSeconds(targetMs))} />
            </div>
            <div className="flex items-center gap-2 rounded-[10px]! border border-line px-3.5 py-2.5 font-mono text-[13px] text-ink">
              毫秒：{targetMs}<CopyButton value={String(targetMs)} />
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
