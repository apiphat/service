(() => {
  'use strict';

  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const toast = document.getElementById('toast');
  const searchInput = document.getElementById('siteSearch');
  const searchables = [...document.querySelectorAll('.searchable')];
  const searchEmpty = document.getElementById('searchEmpty');
  let toastTimer;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2600);
  };

  const safeSet = (key, value) => {
    try { localStorage.setItem(key, value); return true; } catch { return false; }
  };

  const getPagePath = (file) => window.location.pathname.includes('/pages/') ? file : `pages/${file}`;

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
    });

    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.querySelectorAll('[data-soon]').forEach(button => {
    button.addEventListener('click', () => showToast(button.dataset.soon || 'ฟังก์ชันนี้จะเปิดในขั้นตอนถัดไป'));
  });

  const runSearch = (raw) => {
    const q = String(raw || '').trim().toLowerCase();
    if (!searchables.length) return;
    let visible = 0;
    searchables.forEach(card => {
      const haystack = `${card.dataset.search || ''} ${card.textContent || ''}`.toLowerCase();
      const match = !q || haystack.includes(q);
      card.hidden = !match;
      if (match) visible += 1;
    });
    if (searchEmpty) searchEmpty.hidden = visible !== 0;
  };

  searchInput?.addEventListener('input', (event) => runSearch(event.target.value));
  searchInput?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const query = String(searchInput.value || '').trim();
    if (!query) return;
    event.preventDefault();
    safeSet('gfGlobalQuery', query);
    window.location.href = getPagePath('services.html');
  });

  document.querySelectorAll('[data-navigate-game]:not([data-navigate-service])').forEach(button => {
    button.addEventListener('click', () => {
      const game = button.dataset.navigateGame || '';
      if (!game) return;
      safeSet('gfSelectedGame', game);
      localStorage.removeItem('gfSelectedService');
      window.location.href = getPagePath('services.html');
    });
  });

  document.querySelectorAll('[data-navigate-service]').forEach(button => {
    button.addEventListener('click', () => {
      const game = button.dataset.navigateGame || button.dataset.game || '';
      const service = button.dataset.navigateService || '';
      if (game) safeSet('gfSelectedGame', game);
      if (service) safeSet('gfSelectedService', service);
      window.location.href = getPagePath('order.html');
    });
  });

  document.querySelectorAll('[data-category-service]').forEach(button => {
    button.addEventListener('click', () => {
      const service = button.dataset.categoryService || '';
      if (service) safeSet('gfServiceCategory', service);
      window.location.href = getPagePath('services.html');
    });
  });

  document.getElementById('siteSearchForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = String(searchInput?.value || '').trim();
    if (!query) return;
    if (window.location.pathname.includes('/pages/') && document.getElementById('serviceSearch')) {
      const localSearch = document.getElementById('serviceSearch');
      localSearch.value = query;
      localSearch.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }
    if (document.getElementById('gameSearch') && !window.location.pathname.includes('/pages/services.html')) {
      const localSearch = document.getElementById('gameSearch');
      localSearch.value = query;
      localSearch.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }
    safeSet('gfGlobalQuery', query);
    window.location.href = getPagePath('services.html');
  });

  document.querySelectorAll('.floating-help').forEach(button => {
    button.addEventListener('click', () => showToast('เลือกเกม → บริการ → แพ็กเกจ → กรอกข้อมูล → ยืนยันคำสั่งซื้อ'));
  });

  // Expose a small shared API for the other pages without adding a framework.
  window.GameFarm = { showToast, safeSet, getPagePath };
})();
