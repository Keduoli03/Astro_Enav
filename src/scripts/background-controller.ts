import { SEARCH_BG, CONTENT_BG, SEARCH_BG_DARK, CONTENT_BG_DARK, SEARCH_BG_BLUR, CONTENT_BG_BLUR, SEARCH_BG_BLUR_DARK, CONTENT_BG_BLUR_DARK } from '../settings';
import { LIGHT_MODE, DARK_MODE, AUTO_MODE, DEFAULT_THEME } from '../constants/constants';

let applying = false;
let lastSearch = '';
let lastContent = '';
let lastSearchEl = '';
let lastHasContent = false;
let lastGrid = false;

function getStoredTheme(): string {
  const stored = localStorage.getItem('theme');
  return stored || DEFAULT_THEME;
}

function isDarkMode(): boolean {
  const body = document.body;
  if (body && (body.classList.contains('io-black-mode') || body.classList.contains('dark'))) return true;
  const t = getStoredTheme();
  if (t === DARK_MODE) return true;
  if (t === AUTO_MODE) return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return false;
}

function applyBackgrounds(): void {
  if (applying) return;
  applying = true;
  const dark = isDarkMode();
  const searchLight = SEARCH_BG || '';
  const searchDark = SEARCH_BG_DARK || '';
  const contentLight = CONTENT_BG || '';
  const contentDark = CONTENT_BG_DARK || contentLight;
  const searchImg = dark ? searchDark : searchLight;
  const contentImg = dark ? contentDark : contentLight;
  const searchBlur = dark ? (SEARCH_BG_BLUR_DARK ?? SEARCH_BG_BLUR) : SEARCH_BG_BLUR;
  const contentBlur = dark ? (CONTENT_BG_BLUR_DARK ?? CONTENT_BG_BLUR) : CONTENT_BG_BLUR;
  const root = document.documentElement;
  const nextSearch = searchImg ? `url('${searchImg}')` : 'none';
  const nextContent = contentImg ? `url('${contentImg}')` : 'none';
  if (nextSearch !== lastSearch) {
    root.style.setProperty('--search-bg-image', nextSearch);
    lastSearch = nextSearch;
  }
  if (nextContent !== lastContent) {
    root.style.setProperty('--content-bg-image', nextContent);
    lastContent = nextContent;
  }
  root.style.setProperty('--search-bg-blur', `${Number(searchBlur) || 0}px`);
  root.style.setProperty('--content-bg-blur', `${Number(contentBlur) || 0}px`);
  const searchEl = document.getElementById('search-bg') as HTMLElement | null;
  if (searchEl) {
    searchEl.style.position = 'relative';
    searchEl.style.zIndex = '1';
    if (nextSearch !== 'none') {
      searchEl.classList.add('css-img');
      searchEl.classList.remove('css-color');
    } else {
      searchEl.classList.add('css-color');
      searchEl.classList.remove('css-img');
    }
  }
  const body = document.body;
  if (body) {
    const hasContent = !!contentImg;
    if (hasContent !== lastHasContent) {
      if (hasContent) body.classList.add('has-content-bg');
      else body.classList.remove('has-content-bg');
      lastHasContent = hasContent;
    }
  }
  const main = document.querySelector('.main-content');
  if (main) {
    const onlySearch = !!searchImg && !contentImg;
    if (onlySearch !== lastGrid) {
      if (onlySearch) (main as HTMLElement).classList.add('grid-bg');
      else (main as HTMLElement).classList.remove('grid-bg');
      lastGrid = onlySearch;
    }
  }
  applying = false;
}

function observeThemeChanges(): void {
  const body = document.body;
  if (body) {
    const mo = new MutationObserver(() => {
      if (!applying) applyBackgrounds();
    });
    mo.observe(body, { attributes: true, attributeFilter: ['class'] });
  }
  window.addEventListener('storage', (e) => {
    if (e.key === 'theme') applyBackgrounds();
  });
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', applyBackgrounds);
    else if ((mq as any).addListener) (mq as any).addListener(applyBackgrounds);
  }
}

applyBackgrounds();
observeThemeChanges();
try {
  const tryApply = () => {
    const el = document.getElementById('search-bg');
    if (el) applyBackgrounds();
    return !!el;
  };
  if (!tryApply()) {
    const obs = new MutationObserver(() => { if (tryApply()) obs.disconnect(); });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }
} catch {}