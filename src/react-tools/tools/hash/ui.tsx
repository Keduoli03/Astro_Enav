import { useId, useRef, useState } from 'react';
import { FileUp, Type } from 'lucide-react';
import { Button, ButtonRow } from '../../ui/Button';
import { CopyButton } from '../../ui/CopyButton';
import { EditorField } from '../../ui/EditorField';
import { Segmented } from '../../ui/Segmented';
import { formatBytes } from '../../lib/bytes';
import { HASH_ALGORITHMS, hashBlobAll, hashTextAll, type HashAlgorithm } from './logic';

export function HashTool() {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [text, setText] = useState('厘光工具集');
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<Record<HashAlgorithm, string> | null>(null);
  const [computing, setComputing] = useState(false);

  const compute = async () => {
    setComputing(true);
    try {
      const next = mode === 'text' ? await hashTextAll(text) : file ? await hashBlobAll(file) : null;
      setResults(next);
    } finally {
      setComputing(false);
    }
  };

  const canCompute = mode === 'text' ? text.length > 0 : !!file;

  return (
    <div>
      <Segmented
        aria-label="输入类型"
        value={mode}
        onChange={(next) => { setMode(next); setResults(null); }}
        options={[{ value: 'text', label: '文本' }, { value: 'file', label: '文件' }]}
      />

      {mode === 'text' ? (
        <EditorField
          label="待计算文本"
          value={text}
          onChange={(event) => { setText(event.target.value); setResults(null); }}
          counter={`${text.length} 字符`}
        />
      ) : (
        <label
          htmlFor={inputId}
          className="flex! min-h-[180px] cursor-pointer flex-col items-center justify-center gap-4 rounded-[14px] border-2 border-dashed border-line bg-paper px-6 py-10 text-center transition duration-150 hover:border-solid hover:border-accent hover:bg-[color-mix(in_srgb,var(--color-accent)_7%,var(--color-paper))]"
        >
          <span className="grid size-14 shrink-0 place-items-center rounded-full! bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-accent">
            <FileUp size={26} />
          </span>
          {file ? (
            <span className="flex flex-col items-center gap-1.5">
              <strong className="max-w-full truncate text-[15px] font-semibold text-ink">{file.name}</strong>
              <span className="text-[12.5px] text-muted">{formatBytes(file.size)} · 点击重新选择</span>
            </span>
          ) : (
            <span className="flex flex-col items-center gap-1.5">
              <strong className="text-[15px] font-semibold text-ink">点击或拖拽选择文件</strong>
              <span className="text-[12.5px] text-muted">文件仅在本地计算，不会离开你的设备</span>
            </span>
          )}
          <input
            ref={fileInputRef}
            id={inputId}
            type="file"
            className="pointer-events-none absolute opacity-0"
            onChange={(event) => { setFile(event.target.files?.[0] ?? null); setResults(null); }}
          />
        </label>
      )}

      <ButtonRow>
        <Button variant="primary" onClick={compute} disabled={!canCompute || computing}>
          <Type size={16} /> {computing ? '计算中…' : '计算哈希'}
        </Button>
      </ButtonRow>

      {results ? (
        <section className="mt-2 overflow-hidden rounded-[10px]! border border-line">
          {HASH_ALGORITHMS.map((algorithm) => (
            <div key={algorithm} className="flex items-center gap-3 border-b border-line px-3.5 py-3 last:border-b-0">
              <span className="w-[72px] shrink-0 font-mono text-[12px] font-semibold uppercase text-muted">{algorithm}</span>
              <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-ink" title={results[algorithm]}>{results[algorithm]}</code>
              <CopyButton value={results[algorithm]} />
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
