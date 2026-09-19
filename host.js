(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const orderList = $('#orderList');
  const hostEmpty = $('#hostEmpty');
  const searchInput = $('#hostSearch');
  const statusFilter = $('#statusFilter');
  const toast = $('#toast');

  const STATUS_META = {
    Process: { label: 'Process', cls: 'status-process' },
    Succeed: { label: 'Succeed', cls: 'status-success' },
    Unsuccessful: { label: 'Unsuccessful', cls: 'status-failed' }
  };

  function readOrders() {
    try {
      const raw = localStorage.getItem('gfOrders');
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function saveOrders(orders) {
    try {
      localStorage.setItem('gfOrders', JSON.stringify(orders));
      return true;
    } catch {
      return false;
    }
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
  }

  function formatPrice(value) {
    const number = Number(value);
    return Number.isFinite(number) ? `${number.toLocaleString('th-TH')} บาท` : '-';
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  function updateStats(orders) {
    $('#totalCount').textContent = orders.length;
    $('#processCount').textContent = orders.filter((o) => (o.status || 'Process') === 'Process').length;
    $('#successCount').textContent = orders.filter((o) => o.status === 'Succeed').length;
    $('#failedCount').textContent = orders.filter((o) => o.status === 'Unsuccessful').length;
  }

  function filteredOrders(orders) {
    const query = String(searchInput?.value || '').trim().toLowerCase();
    const filter = statusFilter?.value || 'All';
    return orders.filter((order) => {
      const status = order.status || 'Process';
      const matchesStatus = filter === 'All' || status === filter;
      const haystack = `${order.id || ''} ${order.game || ''} ${order.service || ''} ${order.packageName || ''} ${order.playerName || ''}`.toLowerCase();
      return matchesStatus && (!query || haystack.includes(query));
    });
  }

  function rowTemplate(order) {
    const status = order.status || 'Process';
    const meta = STATUS_META[status] || STATUS_META.Process;
    const id = escapeHtml(order.id || '-');
    return `<article class="order-row" data-order-id="${id}">
      <div class="order-main">
        <strong>${id}</strong>
        <small>${escapeHtml(formatDate(order.createdAt))}</small>
      </div>
      <div class="order-meta"><span>เกม / บริการ</span><strong>${escapeHtml(order.game || '-')}</strong><small>${escapeHtml(order.service || '-')}</small></div>
      <div class="order-meta"><span>แพ็กเกจ / ราคา</span><strong>${escapeHtml(order.packageName || '-')}</strong><small>${escapeHtml(formatPrice(order.price))}</small></div>
      <div class="status-block">
        <span class="status-badge ${meta.cls}">${meta.label}</span>
        <select class="status-select" aria-label="สถานะใหม่ของ ${id}" data-status-select>
          <option value="Process" ${status === 'Process' ? 'selected' : ''}>Process</option>
          <option value="Succeed" ${status === 'Succeed' ? 'selected' : ''}>Succeed</option>
          <option value="Unsuccessful" ${status === 'Unsuccessful' ? 'selected' : ''}>Unsuccessful</option>
        </select>
      </div>
      <div class="order-actions">
        <button class="save-btn" type="button" data-save-status>บันทึก</button>
      </div>
    </article>`;
  }

  function render() {
    const allOrders = readOrders();
    updateStats(allOrders);
    const visible = filteredOrders(allOrders).slice().reverse();

    if (!allOrders.length) {
      orderList.innerHTML = '';
      hostEmpty.hidden = false;
      return;
    }

    hostEmpty.hidden = true;
    if (!visible.length) {
      orderList.innerHTML = `<div class="host-empty"><div class="empty-icon">🔎</div><h3>ไม่พบคำสั่งซื้อ</h3><p>ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะครับ</p></div>`;
      return;
    }

    orderList.innerHTML = visible.map(rowTemplate).join('');
  }

  function updateOneOrder(row) {
    const orderId = row?.dataset.orderId;
    const select = row?.querySelector('[data-status-select]');
    if (!orderId || !select) return;

    const orders = readOrders();
    const index = orders.findIndex((item) => String(item.id || '').toUpperCase() === String(orderId).toUpperCase());
    if (index === -1) {
      showToast('ไม่พบคำสั่งซื้อนี้ใน Local Storage');
      render();
      return;
    }

    orders[index].status = select.value;
    orders[index].updatedAt = new Date().toISOString();
    if (saveOrders(orders)) {
      showToast(`อัปเดต ${orderId} เป็น ${select.value} แล้วครับ`);
      render();
    } else {
      showToast('บันทึกสถานะไม่สำเร็จครับ');
    }
  }

  orderList?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-save-status]');
    if (!button) return;
    updateOneOrder(button.closest('[data-order-id]'));
  });

  searchInput?.addEventListener('input', render);
  statusFilter?.addEventListener('change', render);
  $('#refreshBtn')?.addEventListener('click', () => { render(); showToast('รีเฟรชรายการแล้วครับ'); });

  render();
  window.GameFarmHost = { readOrders, saveOrders, render };
})();
