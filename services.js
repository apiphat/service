(() => {
  'use strict';

  const cards = [...document.querySelectorAll('.searchable-service')];
  const tabs = [...document.querySelectorAll('.service-tab')];
  const search = document.getElementById('serviceSearch');
  const empty = document.getElementById('serviceEmpty');
  const selectedBox = document.getElementById('selectedGameBox');
  const selectedLabel = document.getElementById('selectedGameLabel');
  const clearSelected = document.getElementById('clearSelectedGame');
  const toast = document.getElementById('toast');
  let gameFilter = 'all';

  const supported = ['Roblox', 'Minecraft', 'Genshin Impact', 'Mobile Legends'];

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function applyFilters() {
    const query = (search?.value || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const game = card.dataset.game || '';
      const haystack = `${game} ${card.dataset.search || ''} ${card.textContent || ''}`.toLowerCase();
      const matchGame = gameFilter === 'all' || game === gameFilter;
      const matchSearch = !query || haystack.includes(query);
      const show = matchGame && matchSearch;
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (empty) empty.hidden = visible > 0;
  }

  function selectGame(game, persist = true) {
    gameFilter = supported.includes(game) ? game : 'all';
    tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.gameFilter === gameFilter));
    if (selectedBox && selectedLabel) {
      selectedBox.hidden = gameFilter === 'all';
      selectedLabel.textContent = gameFilter;
    }
    if (persist) {
      if (gameFilter === 'all') localStorage.removeItem('gfSelectedGame');
      else localStorage.setItem('gfSelectedGame', gameFilter);
    }
    applyFilters();
  }

  tabs.forEach((tab) => tab.addEventListener('click', () => selectGame(tab.dataset.gameFilter)));
  search?.addEventListener('input', applyFilters);
  clearSelected?.addEventListener('click', () => selectGame('all'));

  document.querySelectorAll('.choose-service').forEach((button) => {
    button.addEventListener('click', () => {
      const game = button.dataset.game || '';
      const service = button.dataset.service || '';
      localStorage.setItem('gfSelectedGame', game);
      localStorage.setItem('gfSelectedService', service);
      window.location.href = 'order.html';
    });
  });

  const params = new URLSearchParams(window.location.search);
  const queryGame = params.get('game');
  const queryService = params.get('service');
  const savedGame = localStorage.getItem('gfSelectedGame');
  const savedCategory = localStorage.getItem('gfServiceCategory');
  const initialGame = supported.includes(queryGame) ? queryGame : (supported.includes(savedGame) ? savedGame : '');

  if (initialGame) selectGame(initialGame);
  else selectGame('all', false);

  const initialServiceSearch = queryService || savedCategory || localStorage.getItem('gfGlobalQuery') || '';
  if (initialServiceSearch && search) {
    search.value = initialServiceSearch;
    applyFilters();
  }
  localStorage.removeItem('gfServiceCategory');
  localStorage.removeItem('gfGlobalQuery');

  document.getElementById('helpButton')?.addEventListener('click', () => {
    showToast('เลือกเกม → เลือกบริการ → เลือกแพ็กเกจ → ไปหน้าสั่งบริการ');
  });
})();
