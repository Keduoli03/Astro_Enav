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

const imgs = document.querySelectorAll('img[data-src]');
const fallbackSrc = '/images/logos/default.webp';
const swap = (img: HTMLImageElement) => {
  const src = img.getAttribute('data-src');
  if (!src) return;
  img.src = src;
  img.removeAttribute('data-src');
  img.addEventListener('error', () => { img.src = fallbackSrc; }, { once: true });
};
if (imgs.length) {
  if (!('IntersectionObserver' in window)) {
    imgs.forEach(el => swap(el as HTMLImageElement));
  } else {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const img = e.target as HTMLImageElement;
          swap(img);
          obs.unobserve(img);
        }
      });
    });
    imgs.forEach(img => obs.observe(img));
  }
}

window.addEventListener('load', () => {
  const siteWelcome = document.getElementById('loading');
  if (!siteWelcome) return;
  siteWelcome.classList.add('close');
  setTimeout(() => { siteWelcome.remove(); }, 600);
});
