let input: HTMLInputElement | null = null;
let list: HTMLUListElement | null = null;
let mInput: HTMLInputElement | null = null;
let mList: HTMLUListElement | null = null;
let currentSearch = '';
function updatePlaceholderAndEngine() {
  const checked = document.querySelector('input[name="type"]:checked') as HTMLInputElement | null;
  if (checked) {
    currentSearch = checked.value || '';
    const ph = checked.getAttribute('data-placeholder');
    if (ph && input) input.placeholder = ph;
    const mainForm = document.querySelector('#search-bg .super-search-fm') as HTMLFormElement | null;
    if (mainForm) mainForm.action = currentSearch;
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
  mInput = document.getElementById('m_search-text') as HTMLInputElement | null;
  mList = document.getElementById('m_word') as HTMLUListElement | null;
  const forms = document.querySelectorAll('.super-search-fm') as NodeListOf<HTMLFormElement>;
  const engineRadios = document.querySelectorAll('input[name="type"]') as NodeListOf<HTMLInputElement>;
  const modalRadios = document.querySelectorAll('input[name="type2"]') as NodeListOf<HTMLInputElement>;
  if (!forms.length) return false;
  updatePlaceholderAndEngine();
  if (engineRadios.length) engineRadios.forEach(r => r.addEventListener('change', updatePlaceholderAndEngine));
  if (modalRadios.length) modalRadios.forEach(r => r.addEventListener('change', () => {
    const checked = document.querySelector('input[name="type2"]:checked') as HTMLInputElement | null;
    const ph = checked?.getAttribute('data-placeholder') || '';
    const mInput = document.getElementById('m_search-text') as HTMLInputElement | null;
    if (ph && mInput) mInput.placeholder = ph;
    const mForm = document.querySelector('#search-modal .super-search-fm') as HTMLFormElement | null;
    if (mForm && checked) mForm.action = checked.value || '';
    const val = (mInput?.value.trim() || '');
    if (val) {
      const isLocal = !!(checked && checked.id === 'm_type-local');
      if (!isLocal) fetchSuggestionsTo(val, mList);
      else {
        if (mList) mList.style.display = 'none';
        const card = mList?.parentElement as HTMLElement | null;
        if (card) card.style.display = 'none';
      }
    }
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
      const checked = document.querySelector('#search-bg input[name="type"]:checked') as HTMLInputElement | null;
      if (checked && checked.id === 'type-local') {
        if (list) list.style.display = 'none';
        return;
      }
      fetchSuggestions(q);
    });
  }
  if (mInput) {
    const field = mInput as HTMLInputElement;
    field.addEventListener('keyup', () => {
      const q = field.value.trim();
      if (!q) {
        if (mList) mList.style.display = 'none';
        const card = mList?.parentElement as HTMLElement | null;
        if (card) card.style.display = 'none';
        return;
      }
      const checked = document.querySelector('#search-modal input[name="type2"]:checked') as HTMLInputElement | null;
      const isLocal = !!(checked && checked.id === 'm_type-local');
      if (isLocal) {
        if (mList) mList.style.display = 'none';
        const card = mList?.parentElement as HTMLElement | null;
        if (card) card.style.display = 'none';
        return;
      }
      fetchSuggestionsTo(q, mList);
    });
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
function fetchSuggestionsTo(q: string, target: HTMLUListElement | null) {
  const cbName = `__bdSugCb_${Date.now()}_${jsonpSeq++}`;
  const script = document.createElement('script');
  (window as any)[cbName] = (res: any) => {
    try {
      renderSuggestionsTo(target, Array.isArray(res?.s) ? res.s : []);
    } finally {
      delete (window as any)[cbName];
      script.remove();
    }
  };
  script.src = `https://suggestion.baidu.com/su?wd=${encodeURIComponent(q)}&cb=${cbName}`;
  script.onerror = () => {
    renderSuggestionsTo(target, []);
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
function renderSuggestionsTo(target: HTMLUListElement | null, items: string[]) {
  if (!target) return;
  target.innerHTML = '';
  const card = target.parentElement as HTMLElement | null;
  if (!items || !items.length) {
    target.style.display = 'none';
    if (card) card.style.display = 'none';
    return;
  }
  target.style.display = 'block';
  items.forEach((text, i) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = String(i + 1);
    li.appendChild(span);
    li.appendChild(document.createTextNode(text));
    li.addEventListener('click', () => {
      const field = mInput as HTMLInputElement | null;
      if (field) field.value = text;
      target.style.display = 'none';
      openSearch(text);
    });
    target.appendChild(li);
  });
  if (card) card.style.display = 'block';
}
// input keyup is attached in init
document.addEventListener('click', (e) => {
  const target = e.target as Element | null;
  const container = document.querySelector('.io-grey-mode');
  if (list && container && target && container.contains(target)) {
    list.style.display = 'none';
  }
});
const modalEl = document.getElementById('search-modal') as HTMLElement | null;
const onModalShown = () => {
  const q = (mInput?.value.trim() || '');
  if (!q) return;
  const checked = document.querySelector('#search-modal input[name="type2"]:checked') as HTMLInputElement | null;
  const isLocal = !!(checked && checked.id === 'm_type-local');
  if (!isLocal) fetchSuggestionsTo(q, mList);
};
if (modalEl) {
  modalEl.addEventListener('shown.bs.modal', onModalShown);
  modalEl.addEventListener('modal:shown', onModalShown);
}
