import {
  SEARCH_BG_BLUR,
  CONTENT_BG_BLUR,
  SEARCH_BG_BLUR_DARK,
  CONTENT_BG_BLUR_DARK,
} from '../settings';
import { DARK_MODE, DEFAULT_THEME } from '../constants/constants';

function getStoredTheme(): string {
  try { return localStorage.getItem('theme') || DEFAULT_THEME; } catch { return DEFAULT_THEME; }
}

function isDarkMode(): boolean {
  return document.body.classList.contains('io-black-mode') || getStoredTheme() === DARK_MODE;
}

function applyLayerSource(layer: HTMLElement | null, dark: boolean): Promise<void> {
  if (!layer) return Promise.resolve();
  const image = layer.querySelector<HTMLImageElement>('img');
  if (!image) return Promise.resolve();
  const source = dark ? layer.dataset.darkSrc : layer.dataset.lightSrc;
  if (!source || image.getAttribute('src') === source) return Promise.resolve();

  // Keep the currently visible image until the next one is ready. Assigning
  // the new src immediately leaves the image empty for a frame, which is
  // especially noticeable during the dark-to-light theme transition.
  if (!image.getAttribute('src')) {
    image.src = source;
    return Promise.resolve();
  }

  layer.dataset.pendingSrc = source;
  return new Promise((resolve) => {
    const preload = new Image();
    const commit = () => {
      if (layer.dataset.pendingSrc === source) {
        image.src = source;
        delete layer.dataset.pendingSrc;
      }
      resolve();
    };
    preload.onload = commit;
    preload.onerror = commit;
    preload.src = source;
  });
}

async function applyBackgrounds(): Promise<void> {
  const dark = isDarkMode();
  const searchBlur = dark ? SEARCH_BG_BLUR_DARK : SEARCH_BG_BLUR;
  const contentBlur = dark ? CONTENT_BG_BLUR_DARK : CONTENT_BG_BLUR;
  const root = document.documentElement;
  const searchLayer = document.querySelector<HTMLElement>('.search-bg-layer');
  const contentLayer = document.getElementById('global-bg');
  const searchImage = dark ? searchLayer?.dataset.darkSrc : searchLayer?.dataset.lightSrc;
  const contentImage = dark ? contentLayer?.dataset.darkSrc : contentLayer?.dataset.lightSrc;

  root.style.setProperty('--search-bg-blur', `${Number(searchBlur) || 0}px`);
  root.style.setProperty('--content-bg-blur', `${Number(contentBlur) || 0}px`);
  await Promise.all([
    applyLayerSource(searchLayer, dark),
    applyLayerSource(contentLayer, dark),
  ]);

  const search = document.getElementById('search-bg');
  search?.classList.toggle('css-img', Boolean(searchImage));
  search?.classList.toggle('css-color', !searchImage);
  document.body.classList.toggle('has-content-bg', Boolean(contentImage));
  document.querySelector('.main-content')?.classList.toggle('grid-bg', Boolean(searchImage && !contentImage));
}

applyBackgrounds();
document.addEventListener('astro:page-load', applyBackgrounds);
window.addEventListener('storage', (event) => { if (event.key === 'theme') applyBackgrounds(); });

(window as typeof window & { __applyBackgrounds?: () => void }).__applyBackgrounds = applyBackgrounds;
