// One-time migration script: prefixes every Tailwind utility token with
// `tw:` inside className="..."/className={...} JSX attributes, plus a
// hand-verified allowlist of class-holding constants (BASE/VARIANTS in
// Button.tsx, PREVIEW/PANE_FILE in image/ui.tsx, TOOLBAR_BTN in json/ui.tsx).
// Deliberately does NOT touch string/template literals outside those two
// scopes (aria-label text, option values like 'SHA-256', sample data) to
// avoid corrupting non-class strings.
//
// Handles template literals whose ${...} interpolations themselves contain
// string literals (e.g. `base ${cond ? 'a' : 'b'}`) by recursing into the
// interpolation expression rather than treating it as opaque — a plain
// "protect ${...} as a single opaque block" approach misses these nested
// class fragments entirely.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'src/react-tools');

function prefixTokens(text) {
  return text
    .split(/(\s+)/)
    .map((chunk) => {
      if (/^\s*$/.test(chunk) || chunk === '') return chunk;
      if (chunk.startsWith('tw:')) return chunk;
      return `tw:${chunk}`;
    })
    .join('');
}

function findMatchingBacktick(str, start) {
  let i = start + 1;
  let braceDepth = 0;
  while (i < str.length) {
    if (str[i] === '\\') { i += 2; continue; }
    if (braceDepth === 0 && str[i] === '`') return i;
    if (str[i] === '$' && str[i + 1] === '{') { braceDepth++; i += 2; continue; }
    if (braceDepth > 0 && str[i] === '{') { braceDepth++; i++; continue; }
    if (braceDepth > 0 && str[i] === '}') { braceDepth--; i++; continue; }
    i++;
  }
  return i;
}

// Transforms a backtick template literal (raw includes the surrounding
// backticks): prefixes static text runs, recurses into ${...} expressions
// looking for further string/template literals to prefix.
function transformTemplateLiteral(raw) {
  const closeIdx = findMatchingBacktick(raw, 0);
  const inner = raw.slice(1, closeIdx);
  let out = '';
  let i = 0;
  let textRun = '';
  const flush = () => { out += prefixTokens(textRun); textRun = ''; };
  while (i < inner.length) {
    if (inner[i] === '\\') { textRun += inner.slice(i, i + 2); i += 2; continue; }
    if (inner[i] === '$' && inner[i + 1] === '{') {
      flush();
      let depth = 1;
      let j = i + 2;
      while (j < inner.length && depth > 0) {
        if (inner[j] === '{') depth++;
        else if (inner[j] === '}') depth--;
        j++;
      }
      const exprRaw = inner.slice(i + 2, j - 1);
      out += '${' + transformStringLiterals(exprRaw) + '}';
      i = j;
      continue;
    }
    textRun += inner[i];
    i++;
  }
  flush();
  return '`' + out + '`';
}

// Walks an arbitrary JS expression string, transforming every top-level
// '...'/`...` literal it finds (recursing into template interpolations).
// Non-string content (identifiers, operators, ternary syntax) passes through
// unchanged.
function transformStringLiterals(expr) {
  let out = '';
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (ch === '`') {
      const transformed = transformTemplateLiteral(expr.slice(i));
      out += transformed;
      i += findMatchingBacktick(expr.slice(i), 0) + 1;
    } else if (ch === "'") {
      const end = expr.indexOf("'", i + 1);
      const value = expr.slice(i + 1, end);
      out += "'" + prefixTokens(value) + "'";
      i = end + 1;
    } else {
      out += ch;
      i++;
    }
  }
  return out;
}

function transformClassAttrs(source) {
  let out = '';
  let i = 0;
  while (i < source.length) {
    const idx = source.indexOf('className=', i);
    if (idx === -1) { out += source.slice(i); break; }
    out += source.slice(i, idx) + 'className=';
    const j = idx + 'className='.length;
    if (source[j] === '"') {
      const end = source.indexOf('"', j + 1);
      const value = source.slice(j + 1, end);
      out += `"${prefixTokens(value)}"`;
      i = end + 1;
    } else if (source[j] === '{') {
      let depth = 1;
      let k = j + 1;
      while (k < source.length && depth > 0) {
        if (source[k] === '{') depth++;
        else if (source[k] === '}') depth--;
        k++;
      }
      const inner = source.slice(j + 1, k - 1);
      out += `{${transformStringLiterals(inner)}}`;
      i = k;
    } else {
      out += source[j];
      i = j + 1;
    }
  }
  return out;
}

const CONST_ALLOWLIST = {
  'ui/Button.tsx': ['BASE', 'VARIANTS'],
  'tools/image/ui.tsx': ['PREVIEW', 'PANE_FILE'],
  'tools/json/ui.tsx': ['TOOLBAR_BTN'],
};

function transformAllowlistedConsts(source, idents) {
  let result = source;
  for (const ident of idents) {
    if (ident === 'VARIANTS') {
      result = result.replace(
        /(const VARIANTS:[^=]*=\s*\{)([\s\S]*?)(\n\};)/,
        (_, head, body, tail) => head + transformStringLiterals(body) + tail,
      );
      continue;
    }
    const re = new RegExp(`(const ${ident} =\\s*)('([^']*)'|\`([^\`]*)\`)`, 'm');
    result = result.replace(re, (_, head, whole) => head + transformStringLiterals(whole));
  }
  return result;
}

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.tsx')) files.push(full);
  }
})(ROOT);

let changed = 0;
for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  let source = fs.readFileSync(file, 'utf8');
  const before = source;

  source = transformClassAttrs(source);
  if (CONST_ALLOWLIST[rel]) {
    source = transformAllowlistedConsts(source, CONST_ALLOWLIST[rel]);
  }

  if (source !== before) {
    fs.writeFileSync(file, source);
    changed++;
    console.log('prefixed:', rel);
  }
}
console.log(`\n${changed}/${files.length} files changed`);
