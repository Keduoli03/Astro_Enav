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
let modalBackdrop: HTMLDivElement | null = null;
let lastFocusedElement: HTMLElement | null = null;

function getModalFocusables(): HTMLElement[] {
  if (!modal) return [];
  return Array.from(modal.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
    .filter((element) => !element.hasAttribute('disabled') && element.offsetParent !== null);
}

function openModal(trigger?: HTMLElement) {
  if (!modal || modal.classList.contains('show')) return;
  lastFocusedElement = trigger || (document.activeElement instanceof HTMLElement ? document.activeElement : null);
  modal.style.display = 'block';
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop fade show';
  document.body.appendChild(modalBackdrop);
  document.body.style.overflow = 'hidden';
  document.body.classList.add('modal-open');
  modal.dispatchEvent(new CustomEvent('modal:shown'));
  requestAnimationFrame(() => {
    const searchInput = modal.querySelector<HTMLInputElement>('#m_search-text');
    (searchInput || getModalFocusables()[0])?.focus();
  });
}

function closeModal() {
  if (!modal || !modal.classList.contains('show')) return;
  modal.classList.remove('show');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  modalBackdrop?.remove();
  modalBackdrop = null;
  document.body.style.overflow = '';
  document.body.classList.remove('modal-open');
  lastFocusedElement?.focus();
  lastFocusedElement = null;
}

document.querySelectorAll<HTMLElement>(modalLinkSelector).forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    openModal(trigger);
  });
});

document.addEventListener('click', (event) => {
  const target = event.target as Element | null;
  if (target?.closest('[data-dismiss="modal"]')) {
    event.preventDefault();
    closeModal();
  }
});

window.addEventListener('keydown', (event) => {
  if (!modal?.classList.contains('show')) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeModal();
    return;
  }
  if (event.key !== 'Tab') return;
  const focusables = getModalFocusables();
  if (!focusables.length) {
    event.preventDefault();
    modal.focus();
    return;
  }
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

modal?.addEventListener('click', (event) => {
  if (event.target === modal) closeModal();
});

const FAVICON_LOAD_TIMEOUT = 7000;

const loadFavicon = (img: HTMLImageElement) => {
  const src = img.getAttribute('data-src');
  if (!src || img.dataset.faviconState === 'loading' || img.dataset.faviconState === 'loaded') return;

  img.dataset.faviconState = 'loading';
  const probe = new Image();
  probe.decoding = 'async';
  let settled = false;

  const settle = (success: boolean) => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    probe.onload = null;
    probe.onerror = null;
    if (!success) probe.src = 'data:,';
    if (success) img.src = probe.currentSrc || src;
    img.dataset.faviconState = success ? 'loaded' : 'fallback';
    img.removeAttribute('data-src');
    img.classList.add('is-ready');
  };

  const timer = window.setTimeout(() => settle(false), FAVICON_LOAD_TIMEOUT);
  probe.onload = () => settle(true);
  probe.onerror = () => settle(false);
  probe.src = src;
};

const faviconObserver = ('IntersectionObserver' in window)
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const img = entry.target as HTMLImageElement;
        faviconObserver?.unobserve(img);
        loadFavicon(img);
      });
    }, { rootMargin: '320px 0px', threshold: 0.01 })
  : null;

const scanFavicons = () => {
  const faviconImages = Array.from(document.querySelectorAll('img.site-favicon[data-src]')) as HTMLImageElement[];
  if (!faviconImages.length) return;
  if (faviconObserver) faviconImages.forEach((img) => faviconObserver.observe(img));
  else faviconImages.forEach(loadFavicon);
};

scanFavicons();
document.addEventListener('astro:page-load', scanFavicons);

window.addEventListener('load', () => {
  const siteWelcome = document.getElementById('loading');
  if (!siteWelcome) return;
  siteWelcome.classList.add('close');
  setTimeout(() => { siteWelcome.remove(); }, 600);
});
