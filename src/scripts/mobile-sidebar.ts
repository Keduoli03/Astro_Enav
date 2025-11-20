const mm = window.matchMedia('(max-width: 991.98px)');
let enabled = false;
let backdrop: HTMLDivElement | null = null;

const btn = document.getElementById('sidebar-switch') as HTMLElement | null;
const sidebar = document.getElementById('sidebar') as HTMLElement | null;
const panel = sidebar ? (sidebar.querySelector('.sidebar-nav-inner') as HTMLElement | null) : null;

function isHomePage(): boolean {
  return window.location.pathname === '/' || window.location.pathname === '/index.html';
}

function openSidebar() {
  if (!sidebar) return;
  sidebar.style.display = 'block';
  sidebar.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  if (!sidebar) return;
  sidebar.classList.remove('show');
  sidebar.style.display = 'none';
  document.body.style.overflow = '';
}

function smoothScrollTo(target: HTMLElement) {
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function onPrimaryClick(e: Event) {
  const link = e.currentTarget as HTMLElement;
  e.preventDefault();
  e.stopPropagation();
  const li = link.closest('.sidebar-item');
  if (!li) return;
  const arrow = (e.target as Element | null)?.closest?.('.sidebar-more');
  const hasSubmenu = li.classList.contains('has-submenu');
  if (arrow) { li.classList.toggle('sidebar-show'); return; }
  if (hasSubmenu) {
    const wasOpen = li.classList.contains('sidebar-show');
    document.querySelectorAll('.sidebar-item.has-submenu').forEach(item => { if (item !== li) item.classList.remove('sidebar-show'); });
    if (!wasOpen) { li.classList.add('sidebar-show'); return; }
  }
  const categoryId = link.getAttribute('data-category-id') || '';
  if (!categoryId) return;
  const targetId = `category-${categoryId.toLowerCase().replace(/\s+/g, '-')}`;
  if (!isHomePage()) { window.location.href = `/#${targetId}`; return; }
  const targetElement = document.getElementById(targetId);
  if (targetElement) { setTimeout(() => smoothScrollTo(targetElement), 0); }
}

function onSecondaryClick(e: Event) {
  const link = e.currentTarget as HTMLElement;
  e.preventDefault();
  const categoryId = link.getAttribute('data-category-id') || '';
  if (!categoryId) return;
  const targetId = `category-${categoryId.toLowerCase().replace(/\s+/g, '-')}`;
  if (!isHomePage()) { window.location.href = `/#${targetId}`; return; }
  const targetElement = document.getElementById(targetId);
  if (targetElement) { smoothScrollTo(targetElement); }
}

function enable() {
  if (enabled) return;
  enabled = true;
  if (btn) { btn.addEventListener('click', (e) => { e.preventDefault(); openSidebar(); }); }
  if (panel) { panel.addEventListener('click', (e) => { e.stopPropagation(); }); }
  if (sidebar) {
    sidebar.addEventListener('click', (e) => {
      const target = e.target as Element | null;
      if (target === sidebar) { // 点击遮罩区域关闭
        e.preventDefault();
        closeSidebar();
        return;
      }
      e.stopPropagation();
    });
  }
  document.addEventListener('keydown', (e) => { if ((e as KeyboardEvent).key === 'Escape') closeSidebar(); });
  document.querySelectorAll('.sidebar-menu-inner .sidebar-item > a').forEach(el => el.addEventListener('click', onPrimaryClick));
  document.querySelectorAll('.sidebar-menu-inner .sidebar-item ul li a[data-category-id]').forEach(el => el.addEventListener('click', onSecondaryClick));
  document.querySelectorAll('#sidebar a[href="#friendlink"]').forEach(el => el.addEventListener('click', (e) => {
    e.preventDefault();
    if (!isHomePage()) { window.location.href = '/#friendlink'; return; }
    const targetElement = document.getElementById('friendlink');
    if (targetElement) { smoothScrollTo(targetElement); }
  }));
}

function disable() {
  if (!enabled) return;
  enabled = false;
  closeSidebar();
}

function applyMedia(m: MediaQueryList | MediaQueryListEvent) {
  if (m.matches) enable(); else disable();
}

applyMedia(mm);
mm.addEventListener('change', applyMedia);