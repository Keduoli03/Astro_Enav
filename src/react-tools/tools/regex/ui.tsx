import { useMemo, useState } from 'react';
import { Braces, CircleAlert } from 'lucide-react';
import { EditorField } from '../../ui/EditorField';
import { ErrorNote } from '../../ui/Segmented';

const FLAGS = ['g', 'i', 'm', 's'];

export function RegexTool() {
  const [pattern, setPattern] = useState('(工具|文本|图片)');
  const [flags, setFlags] = useState('gi');
  const [value, setValue] = useState('厘光工具集可以处理文本、图片与开发数据。好工具应该快，也应该让人放心。');

  const result = useMemo(() => {
    try {
      const regex = new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`);
      return { matches: pattern ? Array.from(value.matchAll(regex)).slice(0, 100) : [], error: '' };
    } catch (error) {
      return { matches: [] as RegExpMatchArray[], error: error instanceof Error ? error.message : '表达式无效' };
    }
  }, [pattern, flags, value]);

  const toggleFlag = (flag: string) =>
    setFlags((current) => (current.includes(flag) ? current.replace(flag, '') : current + flag));

  return (
    <div>
      <label className="grid! h-[48px] grid-cols-[auto_1fr_auto] items-center gap-2 rounded-[10px]! bg-ink px-4 font-mono text-[14px] text-paper">
        <span>/</span>
        <input
          value={pattern}
          onChange={(event) => setPattern(event.target.value)}
          aria-label="正则表达式"
          spellCheck={false}
          className="min-w-0 border-0 bg-transparent font-[inherit] text-[inherit] outline-none"
        />
        <span>/{flags}</span>
      </label>

      <div className="mt-3.5 mb-5 flex items-center gap-2">
        <span className="mr-1 text-[12px] font-medium text-muted">标志</span>
        {FLAGS.map((flag) => (
          <button
            key={flag}
            type="button"
            onClick={() => toggleFlag(flag)}
            className={`size-[32px] cursor-pointer rounded-[8px]! border font-mono text-[13px] transition duration-150 ${
              flags.includes(flag)
                ? 'border-accent bg-accent text-accent-ink'
                : 'border-line bg-surface text-muted hover:border-ink/40 hover:text-ink'
            }`}
          >
            {flag}
          </button>
        ))}
      </div>

      {result.error ? <ErrorNote><CircleAlert size={15} /> {result.error}</ErrorNote> : null}

      <EditorField label="测试文本" value={value} onChange={(event) => setValue(event.target.value)} />

      <section className="mt-5 overflow-hidden rounded-[10px]! border border-line">
        <div className="flex h-[42px] items-center justify-between border-b border-line bg-surface-2 px-3.5">
          <span className="flex items-center gap-2 text-[12px] font-semibold text-ink"><Braces size={16} /> 匹配结果</span>
          <b className="grid h-[22px] min-w-[22px] place-items-center rounded-[6px]! bg-accent px-1.5 font-mono text-[11px] text-accent-ink">
            {result.matches.length}
          </b>
        </div>
        <div className="max-h-[280px] overflow-auto">
          {result.matches.length ? (
            result.matches.map((match, index) => (
              <div
                key={`${match.index}-${index}`}
                className="grid grid-cols-[34px_1fr_auto] items-center gap-2.5 border-b border-line px-3.5 py-2.5 last:border-b-0"
              >
                <span className="font-mono text-[11px] text-muted">#{index + 1}</span>
                <code className="min-w-0 truncate font-mono text-[13px] text-ink">{match[0] || '空匹配'}</code>
                <small className="shrink-0 font-mono text-[11px] text-muted">位置 {match.index}</small>
              </div>
            ))
          ) : (
            <p className="m-0 px-3 py-7 text-center text-[12px] text-muted">
              {result.error ? '修正表达式后将自动测试' : '没有找到匹配内容'}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
