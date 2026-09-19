(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const form = $('#statusSearchForm');
  const input = $('#orderIdInput');
  const emptyState = $('#emptyState');
  const resultContent = $('#resultContent');
  const historyList = $('#historyList');
  const toast = $('#toast');

  function readOrders() {
    try {
      const raw = localStorage.getItem('gfOrders');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }

  function saveOrders(orders) {
    try { localStorage.setItem('gfOrders', JSON.stringify(orders)); return true; } catch { return false; }
  }

  function normalizeId(value) { return String(value || '').trim().toUpperCase(); }

  function formatPrice(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return value || '-';
    return `${n.toLocaleString('th-TH')} บาท`;
  }

  function formatDate(value) {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
  }

  function statusMeta(status) {
    switch (status) {
      case 'Succeed': return { label: 'Succeed', cls: 'status-success', note: 'ดำเนินการเสร็จสิ้นแล้ว' };
      case 'Unsuccessful': return { label: 'Unsuccessful', cls: 'status-failed', note: 'คำสั่งซื้อนี้ไม่สามารถดำเนินการให้สำเร็จได้' };
      default: return { label: 'Process', cls: 'status-process', note: 'คำสั่งซื้อกำลังอยู่ระหว่างดำเนินการ' };
    }
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function updateTimeline(status) {
    const steps = [...document.querySelectorAll('.timeline-step')];
    const lines = [...document.querySelectorAll('.timeline-line')];
    steps.forEach(s => s.classList.remove('active', 'done'));
    lines.forEach(l => l.classList.remove('active'));
    steps[0]?.classList.add('done');
    if (status === 'Process') {
      steps[1]?.classList.add('active');
      lines[0]?.classList.add('active');
    } else if (status === 'Succeed') {
      steps[1]?.classList.add('done'); steps[2]?.classList.add('active');
      lines[0]?.classList.add('active'); lines[1]?.classList.add('active');
    } else {
      steps[1]?.classList.add('active');
      lines[0]?.classList.add('active');
    }
  }

  function renderOrder(order) {
    const meta = statusMeta(order.status);
    $('#resultOrderId').textContent = order.id || '-';
    const badge = $('#statusBadge');
    badge.textContent = meta.label;
    badge.className = `status-badge ${meta.cls}`;
    $('#detailGame').textContent = order.game || '-';
    $('#detailService').textContent = order.service || '-';
    $('#detailPackage').textContent = order.packageName || '-';
    $('#detailPrice').textContent = formatPrice(order.price);
    $('#detailPlayer').textContent = order.playerName || '-';
    $('#detailCreated').textContent = formatDate(order.createdAt);
    $('#statusNote').textContent = meta.note;
    updateTimeline(order.status);
    emptyState.hidden = true;
    resultContent.hidden = false;
  }

  function searchOrder(orderId, silent = false) {
    const id = normalizeId(orderId);
    if (!id) { if (!silent) showToast('กรุณากรอก Order ID ก่อนครับ'); return; }
    const order = readOrders().find(item => normalizeId(item.id) === id);
    if (!order) { emptyState.hidden = false; resultContent.hidden = true; if (!silent) showToast('ไม่พบคำสั่งซื้อหมายเลขนี้'); return; }
    input.value = order.id;
    renderOrder(order);
  }

  function renderHistory() {
    const orders = readOrders().slice().reverse();
    if (!orders.length) {
      historyList.innerHTML = '<div class="history-empty">ยังไม่มีคำสั่งซื้อในเบราว์เซอร์นี้</div>';
      return;
    }
    historyList.innerHTML = orders.map(order => {
      const meta = statusMeta(order.status);
      return `<button class="history-item" type="button" data-order-id="${String(order.id || '').replace(/"/g, '&quot;')}">
        <span class="history-main"><strong>${order.id || '-'}</strong><span>${order.game || '-'} · ${order.service || '-'}</span></span>
        <span class="history-right"><span class="status-badge ${meta.cls}">${meta.label}</span><small>${formatDate(order.createdAt)}</small></span>
      </button>`;
    }).join('');
  }

  form?.addEventListener('submit', (event) => { event.preventDefault(); searchOrder(input.value); });
  $('#latestBtn')?.addEventListener('click', () => {
    const latestId = localStorage.getItem('gfLatestOrderId');
    if (!latestId) { showToast('ยังไม่มีคำสั่งซื้อล่าสุดครับ'); return; }
    searchOrder(latestId);
  });
  $('#refreshHistoryBtn')?.addEventListener('click', renderHistory);
  historyList?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-order-id]');
    if (!button) return;
    searchOrder(button.dataset.orderId);
  });

  const params = new URLSearchParams(window.location.search);
  const paramId = params.get('orderId');
  const latest = localStorage.getItem('gfLatestOrderId');
  if (paramId) searchOrder(paramId, true);
  else if (latest) searchOrder(latest, true);
  renderHistory();

  // Host page will use the same gfOrders array; this page will reflect those changes on refresh.
  window.GameFarmStatus = { readOrders, saveOrders, searchOrder, renderHistory };
})();
