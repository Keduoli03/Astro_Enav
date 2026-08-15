import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button, ButtonRow } from '../../ui/Button';
import { CopyButton } from '../../ui/CopyButton';
import { EditorField } from '../../ui/EditorField';
import { clampCount, COUNT_MAX, COUNT_MIN, generateUuids } from './logic';

const DEFAULT_COUNT = 10;

export function UuidTool() {
  const [count, setCount] = useState(DEFAULT_COUNT);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [output, setOutput] = useState(() => generateUuids(DEFAULT_COUNT).join('\n'));

  const generate = () => setOutput(generateUuids(count, { uppercase, hyphens }).join('\n'));

  return (
    <div>
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <label className="flex! flex-col gap-2">
          <span className="text-[12px] font-medium text-muted">生成数量（1–100）</span>
          <input
            type="number"
            min={COUNT_MIN}
            max={COUNT_MAX}
            value={count}
            onChange={(event) => setCount(clampCount(Number(event.target.value)))}
            className="h-[40px] w-[110px] rounded-[10px]! border border-line bg-paper px-3 font-mono text-[13px] text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/5"
          />
        </label>
        <label className="flex! h-[40px] cursor-pointer items-center gap-2 text-[13px] text-ink">
          <input type="checkbox" checked={uppercase} onChange={(event) => setUppercase(event.target.checked)} className="size-4 accent-accent" />
          大写
        </label>
        <label className="flex! h-[40px] cursor-pointer items-center gap-2 text-[13px] text-ink">
          <input type="checkbox" checked={hyphens} onChange={(event) => setHyphens(event.target.checked)} className="size-4 accent-accent" />
          保留连字符
        </label>
      </div>

      <ButtonRow>
        <Button variant="primary" onClick={generate}><RefreshCw size={16} /> 重新生成</Button>
      </ButtonRow>

      <EditorField label={`生成结果 · ${output ? output.split('\n').length : 0} 个`} value={output} readOnly output>
        <CopyButton value={output} inField />
      </EditorField>
    </div>
  );
}
