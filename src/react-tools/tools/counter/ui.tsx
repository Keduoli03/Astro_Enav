import { useMemo, useState } from 'react';
import { EditorField } from '../../ui/EditorField';
import { analyzeText } from './logic';

const SAMPLE = '厘光工具集是一套本地优先的小工具合集。\n\nIt helps you compress images, encode text, and format JSON — all without leaving the browser.';

function StatTile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-control! border border-line bg-surface px-4 py-3.5">
      <div className="font-mono text-[22px] leading-tight text-ink">{value}</div>
      <div className="mt-1.5 text-[13px] font-medium text-muted">{label}</div>
      {hint ? <div className="mt-1 text-[11px] text-muted">{hint}</div> : null}
    </div>
  );
}

export function CounterTool() {
  const [text, setText] = useState(SAMPLE);
  const stats = useMemo(() => analyzeText(text), [text]);

  return (
    <div>
      <EditorField label="输入文本" value={text} onChange={(event) => setText(event.target.value)} counter={`${stats.chars} 字符`} />

      <div className="mt-5 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatTile label="总字符数" value={stats.chars} />
        <StatTile label="不含空白" value={stats.charsNoSpaces} />
        <StatTile label="中文字符" value={stats.chineseCharacters} />
        <StatTile label="英文单词" value={stats.latinWords} />
        <StatTile label="行数" value={stats.lines} />
        <StatTile label="段落数" value={stats.paragraphs} />
        <StatTile
          label="预计阅读"
          value={stats.readingTime.minutes ? `${stats.readingTime.minutes} 分钟` : '—'}
          hint={stats.readingTime.seconds ? `约 ${stats.readingTime.seconds} 秒` : undefined}
        />
      </div>
    </div>
  );
}
