let input: HTMLInputElement | null = null;
let list: HTMLUListElement | null = null;
let currentSearch = '';
const STORE_KEY = 'selectedSearchEngineId';
const STORE_GROUP_KEY = 'selectedSearchGroupId';
const STORE_GROUP_ENGINE_PREFIX = 'selectedEngineIdForGroup:';
function getGroupIdByEngine(el: Element | null): string {
  if (!el) return '';
  const grp = (el.closest('.search-group') as HTMLElement | null);
  if (!grp) return '';
  const classes = Array.from(grp.classList).filter(c => c !== 'search-group');
  return classes[0] || '';
}
function applyGroup(gid: string) {
  if (!gid) return;
  const groups = document.querySelectorAll('#search-bg .search-group') as NodeListOf<HTMLElement>;
  groups.forEach(g => {
    const show = g.classList.contains(gid);
    g.classList.toggle('s-current', show);
    g.style.display = show ? 'block' : 'none';
  });
  const labels = document.querySelectorAll('#search-list-menu .s-type-list.big label') as NodeListOf<HTMLLabelElement>;
  labels.forEach(l => l.classList.toggle('active', (l.dataset.id || '') === gid));
}
function switchGroupMain(gid: string) {
  if (!gid) return;
  applyGroup(gid);
  const first = document.querySelector(`.search-group.${gid} input[name="type"]`) as HTMLInputElement | null;
  if (first) {
    first.checked = true;
    updatePlaceholderAndEngine();
  }
  try { localStorage.setItem(STORE_GROUP_KEY, gid); } catch {}
}
function applyGroupAndRestoreEngine(gid: string) {
  if (!gid) return;
  applyGroup(gid);
  let target: HTMLInputElement | null = null;
  const savedPerGroup = localStorage.getItem(STORE_GROUP_ENGINE_PREFIX + gid) || '';
  if (savedPerGroup) {
    const el = document.getElementById(savedPerGroup) as HTMLInputElement | null;
    if (el && el.name === 'type') target = el;
  }
  if (!target) {
    const savedGlobal = localStorage.getItem(STORE_KEY) || '';
    if (savedGlobal) {
      const el = document.getElementById(savedGlobal) as HTMLInputElement | null;
      if (el && el.name === 'type' && getGroupIdByEngine(el) === gid) target = el;
    }
  }
  if (!target) target = document.querySelector(`.search-group.${gid} input[name="type"]`) as HTMLInputElement | null;
  if (target) {
    target.checked = true;
    updatePlaceholderAndEngine();
  }
  try { localStorage.setItem(STORE_GROUP_KEY, gid); } catch {}
}
function updatePlaceholderAndEngine() {
  const checked = document.querySelector('input[name="type"]:checked') as HTMLInputElement | null;
  if (checked) {
    currentSearch = checked.value || '';
    const ph = checked.getAttribute('data-placeholder');
    if (ph && input) input.placeholder = ph;
    try { localStorage.setItem(STORE_KEY, checked.id); } catch {}
    const mainForm = document.querySelector('#search-bg .super-search-fm') as HTMLFormElement | null;
    if (mainForm) mainForm.action = currentSearch;
    const gid = getGroupIdByEngine(checked);
    if (gid) {
      try { localStorage.setItem(STORE_GROUP_KEY, gid); } catch {}
      try { localStorage.setItem(STORE_GROUP_ENGINE_PREFIX + gid, checked.id); } catch {}
      applyGroup(gid);
    }
    return;
  }
  const mf = document.querySelector('#search-bg .super-search-fm') as HTMLFormElement | null;
  if (mf) currentSearch = mf.action || '';
}
function openSearch(q: string) {
  let use = '';
  const checked = document.querySelector('input[name="type"]:checked') as HTMLInputElement | null;
  if (checked) use = checked.value || '';
  if (!use) {
    const mf = document.querySelector('#search-bg .super-search-fm') as HTMLFormElement | null;
    if (mf) use = mf.action || '';
  }
  if (!use) return;
  const url = use + encodeURIComponent(q);
  window.open(url, '_blank');
}
function init(): boolean {
  input = document.getElementById('search-text') as HTMLInputElement | null;
  list = document.getElementById('word') as HTMLUListElement | null;
  const forms = document.querySelectorAll('.super-search-fm') as NodeListOf<HTMLFormElement>;
  const engineRadios = document.querySelectorAll('input[name="type"]') as NodeListOf<HTMLInputElement>;
  const modalRadios = document.querySelectorAll('input[name="type2"]') as NodeListOf<HTMLInputElement>;
  if (!forms.length) return false;
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) {
      const el = document.getElementById(saved) as HTMLInputElement | null;
      if (el) el.checked = true;
    }
    const savedGroup = localStorage.getItem(STORE_GROUP_KEY) || '';
    if (savedGroup) applyGroupAndRestoreEngine(savedGroup);
  } catch {}
  updatePlaceholderAndEngine();
  if (engineRadios.length) engineRadios.forEach(r => r.addEventListener('change', updatePlaceholderAndEngine));
  const catLabels = document.querySelectorAll('#search-list-menu .s-type-list.big label') as NodeListOf<HTMLLabelElement>;
  if (catLabels.length) catLabels.forEach(l => {
    l.addEventListener('click', (e) => {
      const gid = (l.dataset.id || '');
      if (gid) applyGroupAndRestoreEngine(gid);
    });
  });
  if (modalRadios.length) modalRadios.forEach(r => r.addEventListener('change', () => {
    const checked = document.querySelector('input[name="type2"]:checked') as HTMLInputElement | null;
    const ph = checked?.getAttribute('data-placeholder') || '';
    const mInput = document.getElementById('m_search-text') as HTMLInputElement | null;
    if (ph && mInput) mInput.placeholder = ph;
    const mForm = document.querySelector('#search-modal .super-search-fm') as HTMLFormElement | null;
    if (mForm && checked) mForm.action = checked.value || '';
  }));
  forms.forEach(f => {
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const field = (f.querySelector('input[type="text"]') as HTMLInputElement | null) || input;
      const q = (field && field.value.trim()) || '';
      if (!q) return;
      const scope = f.closest('.s-search') || document;
      const c1 = scope.querySelector('input[name="type"]:checked') as HTMLInputElement | null;
      const c2 = scope.querySelector('input[name="type2"]:checked') as HTMLInputElement | null;
      const use = (c1?.value || c2?.value || f.action || '');
      if (!use) return;
      const url = use + encodeURIComponent(q);
      window.open(url, '_blank');
    });
  });
  if (input) {
    const field = input as HTMLInputElement;
    field.addEventListener('keyup', () => {
      const q = field.value.trim();
      if (!q) {
        if (list) list.style.display = 'none';
        return;
      }
      fetchSuggestions(q);
    });
  }
  // Fallback: 若仍无选中项，默认切换到首个分类
  if (!document.querySelector('#search-bg input[name="type"]:checked')) {
    const firstLabel = document.querySelector('#search-list-menu .s-type-list.big label') as HTMLLabelElement | null;
    const gid = firstLabel?.dataset.id || '';
    if (gid) applyGroupAndRestoreEngine(gid);
  }
  return true;
}
if (!init()) {
  document.addEventListener('DOMContentLoaded', () => { if (!init()) {
    const obs = new MutationObserver(() => { if (init()) obs.disconnect(); });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }});
}
let jsonpSeq = 0;
function fetchSuggestions(q: string) {
  const cbName = `__bdSugCb_${Date.now()}_${jsonpSeq++}`;
  const script = document.createElement('script');
  (window as any)[cbName] = (res: any) => {
    try {
      renderSuggestions(Array.isArray(res?.s) ? res.s : []);
    } finally {
      delete (window as any)[cbName];
      script.remove();
    }
  };
  script.src = `https://suggestion.baidu.com/su?wd=${encodeURIComponent(q)}&cb=${cbName}`;
  script.onerror = () => {
    renderSuggestions([]);
    delete (window as any)[cbName];
    script.remove();
  };
  document.head.appendChild(script);
}
function renderSuggestions(items: string[]) {
  if (!list) return;
  list.innerHTML = '';
  if (!items || !items.length) {
    if (list) list.style.display = 'none';
    return;
  }
  if (list) list.style.display = 'block';
  items.forEach((text, i) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = String(i + 1);
    li.appendChild(span);
    li.appendChild(document.createTextNode(text));
    li.addEventListener('click', () => {
      const field = input as HTMLInputElement | null;
      if (field) field.value = text;
      if (list) list.style.display = 'none';
      openSearch(text);
    });
    list.appendChild(li);
  });
}
// input keyup is attached in init
document.addEventListener('click', (e) => {
  const target = e.target as Element | null;
  const container = document.querySelector('.io-grey-mode');
  if (list && container && target && container.contains(target)) {
    list.style.display = 'none';
  }
});