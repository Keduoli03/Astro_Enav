import { SIDEBAR_BLUR, SIDEBAR_OPACITY, SIDEBAR_OPACITY_DARK, SIDEBAR_POPUP_OPACITY, SIDEBAR_POPUP_OPACITY_DARK, SIDEBAR_BORDER_COLOR_LIGHT, SIDEBAR_BORDER_COLOR_DARK } from '../settings';
import { LIGHT_MODE, DARK_MODE, AUTO_MODE, DEFAULT_THEME } from '../constants/constants';

function getStoredTheme(): string {
  try { const t = localStorage.getItem('theme'); return t || DEFAULT_THEME; } catch { return DEFAULT_THEME; }
}

function isDarkMode(): boolean {
  const b = document.body;
  if (b && (b.classList.contains('io-black-mode') || b.classList.contains('dark'))) return true;
  const t = getStoredTheme();
  if (t === DARK_MODE) return true;
  if (t === AUTO_MODE) return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  return false;
}

function applySidebarVars(): void {
  const dark = isDarkMode();
  const r = document.documentElement;
  const sbc = dark
    ? `linear-gradient(to bottom, rgba(34,36,38,${SIDEBAR_OPACITY_DARK}), rgba(34,36,38,${SIDEBAR_OPACITY_DARK * 0.8}))`
    : `linear-gradient(to bottom, rgba(255,255,255,${SIDEBAR_OPACITY}), rgba(255,255,255,${SIDEBAR_OPACITY * 0.7}))`;
  const spc = dark
    ? `linear-gradient(to bottom, rgba(21,22,24,${SIDEBAR_POPUP_OPACITY_DARK}), rgba(21,22,24,${SIDEBAR_POPUP_OPACITY_DARK * 0.85}))`
    : `linear-gradient(to bottom, rgba(245,245,245,${SIDEBAR_POPUP_OPACITY}), rgba(245,245,245,${SIDEBAR_POPUP_OPACITY * 0.85}))`;
  const bc = dark ? SIDEBAR_BORDER_COLOR_DARK : SIDEBAR_BORDER_COLOR_LIGHT;
  const txt = dark ? '#ffffff' : '#20272b';
  const hoverBg = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)';
  const activeBg = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const submenuBg = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  r.style.setProperty('--sidebar-blur', `${SIDEBAR_BLUR || 12}px`);
  r.style.setProperty('--sidebar-bg-color', sbc);
  r.style.setProperty('--sidebar-border-color', bc);
  r.style.setProperty('--sidebar-popup-bg-color', spc);
  r.style.setProperty('--sidebar-popup-arrow-color', spc);
  r.style.setProperty('--sidebar-text-color', txt);
  r.style.setProperty('--sidebar-hover-bg', hoverBg);
  r.style.setProperty('--sidebar-active-bg', activeBg);
  r.style.setProperty('--sidebar-submenu-bg', submenuBg);
  r.style.setProperty('--sidebar-title-color', dark ? '#ffffff' : '#1b2226');
}

function init(): void {
  applySidebarVars();
  try {
    const mo = new MutationObserver(applySidebarVars);
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  } catch {}
  try {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq && mq.addEventListener) mq.addEventListener('change', applySidebarVars);
    else if (mq && mq.addListener) mq.addListener(applySidebarVars);
  } catch {}
  window.addEventListener('storage', (e) => { if (e.key === 'theme') applySidebarVars(); });
}

init();