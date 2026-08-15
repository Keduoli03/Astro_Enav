import { useId, useMemo, useState } from 'react';
import { Check, Clipboard, Minimize2, Trash2, WandSparkles, WrapText } from 'lucide-react';
import { useCopy } from '../../lib/clipboard';

const SAMPLE = `{"name":"厘光工具集","privacy":"local-first","tools":["image","base64","regex","json"],"ready":true}`;
const INITIAL_OUTPUT = JSON.stringify(JSON.parse(SAMPLE), null, 2);

const TOOLBAR_BTN =
  'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-[8px]! border border-line bg-code-bg px-3 text-[12px] font-semibold whitespace-nowrap text-ink transition duration-150 hover:border-ink disabled:cursor-not-allowed disabled:opacity-45';

interface EditorPaneProps {
  label: string;
  value: string;
  placeholder?: string;
  readOnly?: boolean;
  wrap: boolean;
  onChange?: (value: string) => void;
}

function EditorPane({ label, value, placeholder, readOnly = false, wrap, onChange }: EditorPaneProps) {
  const editorId = useId();
  const lineCount = Math.max(1, value.split('\n').length);
  return (
    <section className="flex min-w-0 flex-col border-line not-first:border-t md:not-first:border-t-0 md:not-first:border-l">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-line bg-code-chrome px-4">
        <label htmlFor={editorId} className="mb-0! text-[14px] font-bold">{label}</label>
        <span className="font-mono text-[11px] text-muted">{lineCount} 行 · {value.length} 字符</span>
      </header>
      <div className="grid h-[250px] min-w-0 grid-cols-[38px_minmax(0,1fr)] bg-code-bg md:h-[426px] md:grid-cols-[46px_minmax(0,1fr)]">
        <div className="overflow-hidden border-r border-code-gutter-line bg-code-gutter pt-3 pb-3.5 text-code-faint select-none md:pt-3.5" aria-hidden="true">
          {Array.from({ length: lineCount }, (_, index) => (
            <span key={index} className="block h-5 pr-2.5 text-right font-mono text-[12px] leading-5">{index + 1}</span>
          ))}
        </div>
        <textarea
          id={editorId}
          value={value}
          placeholder={placeholder}
          readOnly={readOnly}
          wrap={wrap ? 'soft' : 'off'}
          spellCheck={false}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          aria-label={label}
          className={`size-full resize-none overflow-auto border-0 bg-transparent px-2.5 py-3 font-mono text-[12.5px] leading-5 text-ink [tab-size:2] outline-none placeholder:text-code-faint md:px-4 md:py-3.5 md:text-[13px] ${
            wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
          }`}
        />
      </div>
    </section>
  );
}

export function JsonTool() {
  const [input, setInput] = useState(SAMPLE);
  const [output, setOutput] = useState(INITIAL_OUTPUT);
  const [error, setError] = useState('');
  const [wrap, setWrap] = useState(true);
  const { copied, copy } = useCopy();

  const stats = useMemo(() => {
    try {
      const data = JSON.parse(input);
      return { valid: true, keys: data && typeof data === 'object' ? Object.keys(data).length : 0 };
    } catch (cause) {
      return { valid: false, keys: 0, message: cause instanceof Error ? cause.message : 'JSON 格式无效' };
    }
  }, [input]);

  const transform = (compact: boolean) => {
    try {
      setOutput(JSON.stringify(JSON.parse(input), null, compact ? 0 : 2));
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'JSON 格式无效');
    }
  };

  const clear = () => { setInput(''); setOutput(''); setError(''); };

  return (
    <div className="min-w-0">
      <div className="grid min-h-[470px] grid-cols-1 md:grid-cols-2">
        <EditorPane label="输入 JSON" value={input} placeholder="在这里粘贴 JSON 数据…" wrap={wrap}
          onChange={(value) => { setInput(value); setError(''); }} />
        <EditorPane label="处理结果" value={output} placeholder="格式化结果会显示在这里…" wrap={wrap} readOnly />
      </div>

      {error ? (
        <div role="alert" className="border-t border-[color-mix(in_srgb,var(--color-accent)_28%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-accent)_7%,var(--color-code-bg))] px-4 py-2.5 font-mono text-[12px] text-accent">
          {error}
        </div>
      ) : null}

      <footer className="flex min-h-[54px] flex-col items-start justify-between gap-4 border-t border-line bg-code-chrome py-2 pr-2.5 pl-3.5 md:flex-row md:items-center">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`grid size-[22px] shrink-0 place-items-center rounded-full! ${
            stats.valid
              ? 'bg-[color-mix(in_srgb,var(--color-green)_14%,transparent)] text-green'
              : 'bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] font-extrabold text-accent'
          }`}>
            {stats.valid ? <Check size={14} /> : '!'}
          </span>
          <strong className="text-[12px] whitespace-nowrap">{stats.valid ? 'JSON 有效' : 'JSON 无效'}</strong>
          <span className="hidden max-w-[280px] overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-muted md:inline">
            {stats.valid ? `${stats.keys} 个顶层字段` : stats.message}
          </span>
          <button type="button" onClick={() => setWrap((value) => !value)}
            className={`${TOOLBAR_BTN} ml-auto bg-transparent font-medium text-muted md:ml-1 ${wrap ? 'border-ink' : ''}`}>
            <WrapText size={14} /> 自动换行
          </button>
        </div>
        <div className="grid w-full grid-cols-2 items-center gap-[7px] md:flex md:w-auto md:min-w-0">
          <button type="button" className={`${TOOLBAR_BTN} justify-center md:justify-start`} onClick={() => transform(false)}><WandSparkles size={14} /> 格式化</button>
          <button type="button" className={`${TOOLBAR_BTN} justify-center md:justify-start`} onClick={() => transform(true)}><Minimize2 size={14} /> 压缩</button>
          <button type="button" className={`${TOOLBAR_BTN} justify-center md:justify-start`} onClick={clear}><Trash2 size={14} /> 清空</button>
          <button type="button" onClick={() => copy(output)} disabled={!output}
            className={`${TOOLBAR_BTN} justify-center border-ink bg-ink text-paper md:justify-start`}>
            {copied ? <Check size={14} /> : <Clipboard size={14} />}{copied ? '已复制' : '复制结果'}
          </button>
        </div>
      </footer>
    </div>
  );
}
