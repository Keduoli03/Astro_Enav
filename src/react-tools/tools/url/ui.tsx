import { useMemo, useState } from 'react';
import { ArrowDownUp } from 'lucide-react';
import { Button, ButtonRow } from '../../ui/Button';
import { CopyButton } from '../../ui/CopyButton';
import { EditorField } from '../../ui/EditorField';
import { ErrorNote, Segmented } from '../../ui/Segmented';
import { decodeValue, encodeValue, parseQueryParams, type UrlCodecMode } from './logic';

export function UrlTool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [codecMode, setCodecMode] = useState<UrlCodecMode>('component');
  const [input, setInput] = useState('https://liguang.tools/search?q=厘光 工具&page=1');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const convert = () => {
    if (mode === 'encode') {
      setOutput(encodeValue(input, codecMode));
      setError('');
      return;
    }
    const result = decodeValue(input, codecMode);
    if (result.ok) { setOutput(result.value); setError(''); }
    else { setOutput(''); setError(result.error); }
  };

  const switchMode = () => {
    setMode((current) => (current === 'encode' ? 'decode' : 'encode'));
    setInput(output || input); setOutput(''); setError('');
  };

  const params = useMemo(() => parseQueryParams(input), [input]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <Segmented
          aria-label="转换方向"
          value={mode}
          onChange={(next) => { setMode(next); setOutput(''); setError(''); }}
          options={[{ value: 'encode', label: '编码' }, { value: 'decode', label: '解码' }]}
        />
        <Segmented
          aria-label="编码范围"
          value={codecMode}
          onChange={(next) => { setCodecMode(next); setOutput(''); setError(''); }}
          options={[{ value: 'component', label: '参数值' }, { value: 'full', label: '完整 URL' }]}
        />
      </div>

      <EditorField
        label={mode === 'encode' ? '原始内容' : '已编码内容'}
        value={input}
        onChange={(event) => setInput(event.target.value)}
        counter={`${input.length} 字符`}
      />

      <ButtonRow between>
        <Button onClick={switchMode}><ArrowDownUp size={16} /> 对调</Button>
        <Button variant="primary" onClick={convert}>{mode === 'encode' ? '立即编码' : '立即解码'}</Button>
      </ButtonRow>

      {error ? <ErrorNote>{error}</ErrorNote> : null}

      <EditorField label="转换结果" value={output} readOnly output placeholder="结果会显示在这里…">
        <CopyButton value={output} inField />
      </EditorField>

      {params.length ? (
        <section className="mt-7">
          <h3 className="mb-2.5 text-[14px] font-semibold text-ink">查询参数解析 · {params.length} 项</h3>
          <div className="overflow-hidden rounded-[10px]! border border-line">
            {params.map((param, index) => (
              <div key={`${param.key}-${index}`} className="grid grid-cols-[1fr_1.4fr] gap-3 border-b border-line px-3.5 py-2.5 text-[13px] last:border-b-0">
                <span className="truncate font-mono text-ink" title={param.key}>{param.key}</span>
                <span className="truncate font-mono text-muted" title={param.value}>{param.value}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
