type SearchSite = { title?: string; description?: string; url?: string };

const STORE_ENGINE = 'selectedSearchEngineId';
const STORE_GROUP = 'selectedSearchGroupId';
const STORE_GROUP_ENGINE = 'selectedEngineIdForGroup:';
const LOCAL_ENGINE = 'type-local';
const SUGGEST_TIMEOUT_MS = 6000;

let localSitesPromise: Promise<SearchSite[]> | null = null;
let jsonpSequence = 0;
const requestVersions = new WeakMap<HTMLElement, number>();
const debounceTimers = new WeakMap<HTMLElement, number>();

function readStorage(key: string): string {
  try { return localStorage.getItem(key) || ''; } catch { return ''; }
}

function writeStorage(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch {}
}

function getEngineId(radio: HTMLInputElement | null): string {
  return radio?.dataset.engineId || radio?.id.replace(/^m_/, '') || '';
}

function getGroupId(radio: HTMLInputElement | null): string {
  return radio?.closest<HTMLElement>('[data-search-panel]')?.dataset.searchPanel || '';
}

function getElements(root: HTMLElement) {
  return {
    form: root.querySelector<HTMLFormElement>('.super-search-fm'),
    input: root.querySelector<HTMLInputElement>('.search-key'),
    list: root.querySelector<HTMLUListElement>('[data-search-suggestions]'),
  };
}

function selectedRadio(root: HTMLElement): HTMLInputElement | null {
  return root.querySelector<HTMLInputElement>('input[type="radio"]:checked');
}

function isLocal(root: HTMLElement): boolean {
  return getEngineId(selectedRadio(root)) === LOCAL_ENGINE;
}

function safeOpen(url: string): void {
  try {
    const parsed = new URL(url, window.location.href);
    if (!['http:', 'https:'].includes(parsed.protocol)) return;
    window.open(parsed.href, '_blank', 'noopener,noreferrer');
  } catch {}
}

function setListVisible(root: HTMLElement, visible: boolean): void {
  const { list } = getElements(root);
  const card = list?.closest<HTMLElement>('.search-smart-tips');
  if (list) list.hidden = !visible;
  if (card) card.hidden = !visible;
}

function clearResults(root: HTMLElement): void {
  const { list } = getElements(root);
  list?.replaceChildren();
  setListVisible(root, false);
}

function renderResults(root: HTMLElement, items: SearchSite[], local: boolean): void {
  const { input, list } = getElements(root);
  if (!list) return;
  list.replaceChildren();

  items.forEach((item, index) => {
    const text = item.title || item.url || '';
    const li = document.createElement('li');
    li.tabIndex = 0;
    li.setAttribute('role', 'option');
    if (item.url) li.dataset.url = item.url;

    const badge = document.createElement('span');
    badge.className = local ? 'local' : 'suggestion-index';
    badge.textContent = local ? '本地' : String(index + 1);
    li.append(badge, document.createTextNode(
      local && item.description ? `${text} - ${item.description}` : text
    ));

    const activate = () => {
      if (local && item.url) safeOpen(item.url);
      else if (text) {
        if (input) input.value = text;
        submitNetworkSearch(root, text);
      }
      clearResults(root);
    };
    li.addEventListener('click', activate);
    li.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate();
      }
    });
    list.appendChild(li);
  });
  setListVisible(root, items.length > 0);
}

function getLocalSites(): Promise<SearchSite[]> {
  if (!localSitesPromise) {
    localSitesPromise = fetch('/search-index.json')
      .then((response) => {
        if (!response.ok) throw new Error('Search index request failed');
        return response.json();
      })
      .then((data) => Array.isArray(data) ? data : [])
      .catch(() => []);
  }
  return localSitesPromise;
}

async function searchLocal(root: HTMLElement, query: string): Promise<void> {
  const normalized = query.trim().toLocaleLowerCase('zh-CN');
  if (!normalized) return clearResults(root);
  const version = (requestVersions.get(root) || 0) + 1;
  requestVersions.set(root, version);
  const sites = await getLocalSites();
  if (requestVersions.get(root) !== version || getElements(root).input?.value.trim().toLocaleLowerCase('zh-CN') !== normalized) return;

  const matches = sites.filter((site) =>
    [site.title, site.description, site.url].some((value) =>
      String(value || '').toLocaleLowerCase('zh-CN').includes(normalized)
    )
  ).slice(0, 10);
  renderResults(root, matches, true);
}

function searchNetwork(root: HTMLElement, query: string): void {
  const version = (requestVersions.get(root) || 0) + 1;
  requestVersions.set(root, version);
  const callbackName = `__astroNavSuggest_${Date.now()}_${jsonpSequence++}`;
  const script = document.createElement('script');
  let settled = false;

  const cleanup = () => {
    if (settled) return;
    settled = true;
    clearTimeout(timeout);
    delete (window as unknown as Record<string, unknown>)[callbackName];
    script.remove();
  };
  const finish = (items: string[]) => {
    if (requestVersions.get(root) === version) {
      renderResults(root, items.slice(0, 10).map((title) => ({ title })), false);
    }
    cleanup();
  };

  (window as unknown as Record<string, unknown>)[callbackName] = (response: { s?: unknown }) => {
    const items = Array.isArray(response?.s) ? response.s.filter((item): item is string => typeof item === 'string') : [];
    finish(items);
  };
  const timeout = window.setTimeout(() => finish([]), SUGGEST_TIMEOUT_MS);
  script.onerror = () => finish([]);
  script.src = `https://suggestion.baidu.com/su?wd=${encodeURIComponent(query)}&cb=${callbackName}`;
  document.head.appendChild(script);
}

function submitNetworkSearch(root: HTMLElement, query: string): void {
  const radio = selectedRadio(root);
  const action = radio?.value || getElements(root).form?.action || '';
  if (!action || action === '#') return;
  safeOpen(action + encodeURIComponent(query));
}

function updateEngine(root: HTMLElement, persist = true): void {
  const radio = selectedRadio(root);
  const { form, input } = getElements(root);
  if (!radio) return;
  if (form) form.action = radio.value || form.action;
  if (input && radio.dataset.placeholder) input.placeholder = radio.dataset.placeholder;

  const engineId = getEngineId(radio);
  const groupId = getGroupId(radio);
  root.classList.toggle('local-mode', engineId === LOCAL_ENGINE);
  if (persist) {
    writeStorage(STORE_ENGINE, engineId);
    if (groupId) {
      writeStorage(STORE_GROUP, groupId);
      writeStorage(STORE_GROUP_ENGINE + groupId, engineId);
    }
  }
  const query = input?.value.trim() || '';
  if (!query) clearResults(root);
  else if (engineId === LOCAL_ENGINE) void searchLocal(root, query);
  else searchNetwork(root, query);
}

function switchGroup(root: HTMLElement, groupId: string, preferredEngine = ''): void {
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-search-panel]'));
  if (!panels.some((panel) => panel.dataset.searchPanel === groupId)) return;

  root.querySelectorAll<HTMLElement>('[data-search-group]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.searchGroup === groupId));
  });
  panels.forEach((panel) => {
    const active = panel.dataset.searchPanel === groupId;
    panel.hidden = !active;
    panel.classList.toggle('s-current', active);
  });

  const panel = root.querySelector<HTMLElement>(`[data-search-panel="${CSS.escape(groupId)}"]`);
  const engineId = preferredEngine || readStorage(STORE_GROUP_ENGINE + groupId);
  const radios = Array.from(panel?.querySelectorAll<HTMLInputElement>('input[type="radio"]') || []);
  const radio = radios.find((item) => getEngineId(item) === engineId) || radios[0];
  if (radio) radio.checked = true;

  const current = root.querySelector<HTMLButtonElement>('.search-group-current');
  const activeButton = root.querySelector<HTMLElement>(`[data-search-group="${CSS.escape(groupId)}"]`);
  if (current && activeButton) {
    current.textContent = activeButton.textContent?.trim() || '搜索';
    current.setAttribute('aria-expanded', 'false');
  }
  root.querySelector('.s-type')?.classList.remove('open');
  writeStorage(STORE_GROUP, groupId);
  updateEngine(root);
}

function handleInput(root: HTMLElement): void {
  const { input } = getElements(root);
  const query = input?.value.trim() || '';
  const previousTimer = debounceTimers.get(root);
  if (previousTimer) clearTimeout(previousTimer);
  if (!query) return clearResults(root);
  const timer = window.setTimeout(() => {
    if (isLocal(root)) void searchLocal(root, query);
    else searchNetwork(root, query);
  }, isLocal(root) ? 80 : 220);
  debounceTimers.set(root, timer);
}

function initRoot(root: HTMLElement): void {
  if (root.dataset.searchReady === 'true') return;
  root.dataset.searchReady = 'true';
  const { form, input } = getElements(root);
  if (!form || !input) return;

  root.querySelectorAll<HTMLButtonElement>('[data-search-group]').forEach((button) => {
    button.addEventListener('click', () => switchGroup(root, button.dataset.searchGroup || ''));
  });
  root.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((radio) => {
    radio.addEventListener('change', () => updateEngine(root));
  });
  const currentGroupButton = root.querySelector<HTMLButtonElement>('.search-group-current');
  currentGroupButton?.addEventListener('click', () => {
    const type = root.querySelector('.s-type');
    const open = !type?.classList.contains('open');
    type?.classList.toggle('open', open);
    currentGroupButton.setAttribute('aria-expanded', String(open));
  });
  input.addEventListener('input', () => handleInput(root));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input.value.trim();
    if (!query) return;
    if (isLocal(root)) {
      const first = getElements(root).list?.querySelector<HTMLElement>('li[data-url]');
      if (first?.dataset.url) safeOpen(first.dataset.url);
    } else submitNetworkSearch(root, query);
  });

  const savedGroup = readStorage(STORE_GROUP);
  const fallbackGroup = root.querySelector<HTMLElement>('[data-search-group][aria-pressed="true"]')?.dataset.searchGroup || '';
  switchGroup(root, savedGroup || fallbackGroup, readStorage(STORE_ENGINE));
}

function initSearch(): void {
  document.querySelectorAll<HTMLElement>('[data-search-root]').forEach(initRoot);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSearch, { once: true });
else initSearch();
document.addEventListener('astro:page-load', initSearch);

document.addEventListener('click', (event) => {
  const target = event.target as Element | null;
  document.querySelectorAll<HTMLElement>('[data-search-root]').forEach((root) => {
    if (!target || root.contains(target)) return;
    clearResults(root);
    root.querySelector('.s-type')?.classList.remove('open');
    root.querySelector('.search-group-current')?.setAttribute('aria-expanded', 'false');
  });
});

document.getElementById('search-modal')?.addEventListener('modal:shown', () => {
  const root = document.querySelector<HTMLElement>('[data-search-root="modal"]');
  if (!root) return;
  switchGroup(root, readStorage(STORE_GROUP) || 'group-a', readStorage(STORE_ENGINE));
  handleInput(root);
});
