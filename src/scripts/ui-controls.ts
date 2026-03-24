const goTopBtn = document.getElementById('go-to-up');
const showGoTop = () => {
  const y = window.scrollY || document.documentElement.scrollTop || 0;
  if (!goTopBtn) return;
  goTopBtn.style.display = y > 200 ? 'block' : 'none';
};
showGoTop();
window.addEventListener('scroll', showGoTop, { passive: true });
if (goTopBtn) {
  goTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

const modalLinkSelector = 'a[data-toggle="modal"][data-target="#search-modal"]';
const modal = document.getElementById('search-modal');
const body = document.body;
function openModal() {
  if (!modal) return;
  modal.style.display = 'block';
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop fade show';
  body.appendChild(backdrop);
  body.style.overflow = 'hidden';
  body.classList.add('modal-open');
  modal.dispatchEvent(new CustomEvent('modal:shown'));
}
function closeModal() {
  if (!modal) return;
  modal.classList.remove('show');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  if (backdrop) {
    backdrop.remove();
    backdrop = null;
  }
  body.style.overflow = '';
  body.classList.remove('modal-open');
}
document.querySelectorAll(modalLinkSelector).forEach(a => {
  a.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
});
document.addEventListener('click', (e) => {
  const t = e.target as Element | null;
  if (!t) return;
  if (t.closest('[data-dismiss="modal"]')) {
    e.preventDefault();
    closeModal();
  }
});
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
if (modal) {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

const imgs = Array.from(document.querySelectorAll('img[data-src]')) as HTMLImageElement[];
const fallbackSrc = '/images/logos/default.webp';
const FAVICON_CACHE_PREFIX = 'favicon-cache:v2:';
const FAVICON_CACHE_TTL = 1000 * 60 * 60 * 24 * 14;
const FAVICON_CACHE_INDEX_KEY = 'favicon-cache:index:v2';

type FaviconCacheItem = {
  data: string;
  ts: number;
  at: number;
};

const nowTs = () => Date.now();

const getFaviconDomain = (src: string): string => {
  const m = /^https:\/\/favicon\.im\/([^/?#]+)/i.exec(src || '');
  return m ? decodeURIComponent(m[1]) : '';
};

const getCacheKey = (domain: string) => `${FAVICON_CACHE_PREFIX}${domain}`;

const readCache = (domain: string): FaviconCacheItem | null => {
  try {
    const raw = localStorage.getItem(getCacheKey(domain));
    if (!raw) return null;
    const item = JSON.parse(raw) as FaviconCacheItem;
    if (!item || !item.data || !item.ts) return null;
    if (nowTs() - item.ts > FAVICON_CACHE_TTL) {
      localStorage.removeItem(getCacheKey(domain));
      return null;
    }
    item.at = nowTs();
    localStorage.setItem(getCacheKey(domain), JSON.stringify(item));
    return item;
  } catch {
    return null;
  }
};

const pruneCache = () => {
  try {
    const raw = localStorage.getItem(FAVICON_CACHE_INDEX_KEY) || '[]';
    let index = JSON.parse(raw) as Array<{ key: string; at: number }>;
    if (!Array.isArray(index)) index = [];
    index = index
      .filter(it => !!it?.key && typeof it.at === 'number')
      .sort((a, b) => b.at - a.at)
      .slice(0, 120);
    const keys = new Set(index.map(it => it.key));
    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(FAVICON_CACHE_PREFIX)) continue;
      if (!keys.has(k)) localStorage.removeItem(k);
    }
    localStorage.setItem(FAVICON_CACHE_INDEX_KEY, JSON.stringify(index));
  } catch {}
};

const touchCacheIndex = (domain: string) => {
  try {
    const raw = localStorage.getItem(FAVICON_CACHE_INDEX_KEY) || '[]';
    let index = JSON.parse(raw) as Array<{ key: string; at: number }>;
    if (!Array.isArray(index)) index = [];
    const key = getCacheKey(domain);
    const at = nowTs();
    const next = [{ key, at }, ...index.filter(it => it.key !== key)].slice(0, 160);
    localStorage.setItem(FAVICON_CACHE_INDEX_KEY, JSON.stringify(next));
  } catch {}
};

const writeCacheFromImage = (domain: string, img: HTMLImageElement) => {
  try {
    const canvas = document.createElement('canvas');
    const w = Math.max(16, Math.min(64, img.naturalWidth || 40));
    const h = Math.max(16, Math.min(64, img.naturalHeight || 40));
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, w, h);
    const data = canvas.toDataURL('image/png');
    if (!data || data.length > 120 * 1024) return;
    const item: FaviconCacheItem = { data, ts: nowTs(), at: nowTs() };
    localStorage.setItem(getCacheKey(domain), JSON.stringify(item));
    touchCacheIndex(domain);
  } catch {}
};

const canPrewarm = (): boolean => {
  try {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
    const conn = nav.connection;
    if (conn?.saveData) return false;
    const et = String(conn?.effectiveType || '').toLowerCase();
    if (et.includes('2g')) return false;
    return true;
  } catch {
    return true;
  }
};

const scheduleIdle = (fn: (deadline?: { timeRemaining: () => number; didTimeout?: boolean }) => void) => {
  const w = window as Window & { requestIdleCallback?: (cb: (deadline: { timeRemaining: () => number; didTimeout?: boolean }) => void, opts?: { timeout?: number }) => number };
  if (typeof w.requestIdleCallback === 'function') {
    w.requestIdleCallback(fn as (deadline: { timeRemaining: () => number; didTimeout?: boolean }) => void, { timeout: 1200 });
    return;
  }
  setTimeout(() => fn(), 120);
};

const prewarmFaviconCache = () => {
  if (!canPrewarm() || document.visibilityState === 'hidden') return;

  const seen = new Set<string>();
  const queue: string[] = [];
  imgs.forEach((img) => {
    const pendingSrc = img.getAttribute('data-src') || '';
    const domain = getFaviconDomain(pendingSrc);
    if (!domain || seen.has(domain)) return;
    seen.add(domain);
    if (readCache(domain)) return;
    queue.push(domain);
  });

  if (!queue.length) return;

  const total = Math.min(queue.length, 48);
  const maxConcurrent = 2;
  let index = 0;
  let inFlight = 0;

  const warmOne = (domain: string) => {
    inFlight += 1;
    const probe = new Image();
    probe.crossOrigin = 'anonymous';
    const done = () => { inFlight -= 1; };
    probe.onload = () => {
      writeCacheFromImage(domain, probe);
      done();
    };
    probe.onerror = done;
    probe.src = `https://favicon.im/${encodeURIComponent(domain)}`;
  };

  const run = (deadline?: { timeRemaining: () => number; didTimeout?: boolean }) => {
    if (document.visibilityState === 'hidden') return;
    const canRunNow = () => !deadline || deadline.didTimeout || deadline.timeRemaining() > 6;
    while (index < total && inFlight < maxConcurrent && canRunNow()) {
      warmOne(queue[index]);
      index += 1;
    }
    if (index < total || inFlight > 0) scheduleIdle(run);
  };

  scheduleIdle(run);
};

const migrateAndCleanOldFaviconCache = () => {
  try {
    const oldPrefixes = ['favicon-cache:v1:'];
    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (oldPrefixes.some(prefix => k.startsWith(prefix)) || k === 'favicon-cache:index:v1') {
        localStorage.removeItem(k);
      }
    }
  } catch {}
};

const swap = (img: HTMLImageElement) => {
  const src = img.getAttribute('data-src');
  if (!src) return;

  const markReady = () => { img.classList.add('is-ready'); };

  const domain = getFaviconDomain(src);
  if (domain) {
    const cached = readCache(domain);
    if (cached?.data) {
      img.src = cached.data;
      img.removeAttribute('data-src');
      if (img.complete) markReady();
      else img.addEventListener('load', markReady, { once: true });
      return;
    }
    img.addEventListener('load', () => {
      const loadedSrc = String(img.currentSrc || img.src || '').toLowerCase();
      if (!loadedSrc.includes('favicon.im/')) return;
      writeCacheFromImage(domain, img);
    }, { once: true });
  }

  img.addEventListener('load', markReady, { once: true });
  img.src = src;
  img.removeAttribute('data-src');
  img.addEventListener('error', () => {
    img.addEventListener('load', markReady, { once: true });
    img.src = fallbackSrc;
  }, { once: true });
};
if (imgs.length) {
  migrateAndCleanOldFaviconCache();
  pruneCache();
  const preloadLimit = 24;
  let preloaded = 0;
  imgs.forEach((img) => {
    if (preloaded >= preloadLimit) return;
    const rect = img.getBoundingClientRect();
    if (rect.top < window.innerHeight * 1.5) {
      swap(img);
      preloaded += 1;
    }
  });

  if (!('IntersectionObserver' in window)) {
    imgs.forEach(el => swap(el));
  } else {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const img = e.target as HTMLImageElement;
          swap(img);
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '280px 0px', threshold: 0.01 });
    imgs.forEach(img => {
      if (img.hasAttribute('data-src')) obs.observe(img);
    });
  }

  const bootPrewarm = () => {
    setTimeout(prewarmFaviconCache, 1200);
  };
  if (document.readyState === 'complete') {
    bootPrewarm();
  } else {
    window.addEventListener('load', bootPrewarm, { once: true });
  }
}

window.addEventListener('load', () => {
  const siteWelcome = document.getElementById('loading');
  if (!siteWelcome) return;
  siteWelcome.classList.add('close');
  setTimeout(() => { siteWelcome.remove(); }, 600);
});
