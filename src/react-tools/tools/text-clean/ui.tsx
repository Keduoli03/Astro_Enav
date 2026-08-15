import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button, ButtonRow } from '../../ui/Button';
import { CopyButton } from '../../ui/CopyButton';
import { EditorField } from '../../ui/EditorField';
import { Segmented } from '../../ui/Segmented';
import { cleanText, type WidthMode } from './logic';

const SAMPLE = '  厘光工具集  \n\n\n\n支持   Ａｓｃｉｉ   全角字符\n支持   Ａｓｃｉｉ   全角字符\n\n去除首尾空格与重复空行。';

export function TextCleanTool() {
  const [input, setInput] = useState(SAMPLE);
  const [trimLines, setTrimLines] = useState(true);
  const [collapseBlankLines, setCollapseBlankLines] = useState(true);
  const [dedupeLines, setDedupeLines] = useState(false);
  const [stripInvisible, setStripInvisible] = useState(true);
  const [width, setWidth] = useState<WidthMode>('none');
  const [output, setOutput] = useState('');

  const clean = () => setOutput(cleanText(input, { trimLines, collapseBlankLines, dedupeLines, stripInvisible, width }));

  const checkbox = (checked: boolean, onChange: (value: boolean) => void, label: string) => (
    <label className="flex! h-[38px] cursor-pointer items-center gap-2 text-[13px] text-ink">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-4 accent-accent" />
      {label}
    </label>
  );

  return (
    <div>
      <EditorField label="原始文本" value={input} onChange={(event) => setInput(event.target.value)} counter={`${input.length} 字符`} />

      <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-2">
        {checkbox(trimLines, setTrimLines, '去除首尾空白')}
        {checkbox(collapseBlankLines, setCollapseBlankLines, '合并连续空行')}
        {checkbox(dedupeLines, setDedupeLines, '整行去重')}
        {checkbox(stripInvisible, setStripInvisible, '清除零宽字符')}
      </div>

      <div className="mt-3.5">
        <span className="mb-2 block text-[12px] font-medium text-muted">全角 / 半角</span>
        <Segmented
          aria-label="全半角转换"
          value={width}
          onChange={setWidth}
          options={[{ value: 'none', label: '不转换' }, { value: 'toHalf', label: '转半角' }, { value: 'toFull', label: '转全角' }]}
        />
      </div>

      <ButtonRow>
        <Button variant="primary" onClick={clean}><Sparkles size={16} /> 清洗</Button>
      </ButtonRow>

      <EditorField label={`清洗结果${output ? ` · ${output.length} 字符` : ''}`} value={output} readOnly output placeholder="结果会显示在这里…">
        <CopyButton value={output} inField />
      </EditorField>
    </div>
  );
}
