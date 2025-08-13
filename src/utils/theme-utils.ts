import { LIGHT_MODE, DARK_MODE, AUTO_MODE, DEFAULT_THEME } from '../constants/constants';
import type { LIGHT_DARK_MODE } from '../types/config';

export { LIGHT_MODE, DARK_MODE, AUTO_MODE, DEFAULT_THEME };
export type { LIGHT_DARK_MODE };

export function getDefaultHue(): number {
  const fallback = "250";
  const configCarrier = document.getElementById("config-carrier");
  return Number.parseInt(configCarrier?.dataset.hue || fallback);
}

export function getHue(): number {
  const stored = localStorage.getItem("hue");
  return stored ? Number.parseInt(stored) : getDefaultHue();
}

export function setHue(hue: number): void {
  localStorage.setItem("hue", String(hue));
  const r = document.querySelector(":root") as HTMLElement;
  if (!r) {
    return;
  }
  r.style.setProperty("--hue", String(hue));
}

export function applyThemeToDocument(theme: LIGHT_DARK_MODE) {
  const body = document.body;
  
  // 移除现有的主题类
  body.classList.remove('io-grey-mode', 'io-black-mode');
  
  switch (theme) {
    case LIGHT_MODE:
      body.classList.add('io-grey-mode');
      break;
    case DARK_MODE:
      body.classList.add('io-black-mode');
      break;
    case AUTO_MODE:
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        body.classList.add('io-black-mode');
      } else {
        body.classList.add('io-grey-mode');
      }
      break;
  }
  
  // 更新搜索背景图
  const searchBg = document.getElementById('search-bg');
  if (searchBg) {
    const bgImage = (theme === DARK_MODE || 
      (theme === AUTO_MODE && window.matchMedia("(prefers-color-scheme: dark)").matches))
      ? 'url(images/search-bg.jpg)' 
      : 'url(images/search-bg.jpg)';
    searchBg.style.backgroundImage = bgImage;
  }
}

export function setTheme(theme: LIGHT_DARK_MODE): void {
  localStorage.setItem("theme", theme);
  applyThemeToDocument(theme);
}

export function getStoredTheme(): LIGHT_DARK_MODE {
  const stored = localStorage.getItem("theme") as LIGHT_DARK_MODE;
  if (stored && [LIGHT_MODE, DARK_MODE, AUTO_MODE].includes(stored)) {
    return stored;
  }
  return DEFAULT_THEME;
}