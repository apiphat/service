document.addEventListener('DOMContentLoaded', () => {
  const orderForm = document.getElementById('orderForm');
  const panels = [...document.querySelectorAll('.order-step-panel')];
  const indicators = [...document.querySelectorAll('[data-step-indicator]')];
  const gameSelect = document.getElementById('gameSelect');
  const serviceSelect = document.getElementById('serviceSelect');
  const packageSelect = document.getElementById('packageSelect');
  const packagePreview = document.getElementById('packagePreview');
  const savedSelection = document.getElementById('savedSelection');
  const successPanel = document.getElementById('successPanel');
  const toast = document.getElementById('toast');

  const SERVICE_DATA = {
    'Roblox': {
      'ฟาร์มเลเวล': [
        { name: 'Level 1–50', price: 99, desc: 'แพ็กเกจจำลองสำหรับเก็บเลเวลช่วง 1–50' },
        { name: 'Level 50–100', price: 159, desc: 'แพ็กเกจจำลองสำหรับเก็บเลเวลช่วง 50–100' }
      ],
      'ฟาร์มเงิน': [
        { name: '100K Coins', price: 129, desc: 'เป้าหมายเงินจำลอง 100K' },
        { name: '500K Coins', price: 249, desc: 'เป้าหมายเงินจำลอง 500K' }
      ],
      'ฟาร์มไอเทม': [
        { name: '1 Set', price: 89, desc: 'ฟาร์มไอเทมจำลอง 1 ชุด' },
        { name: '3 Sets', price: 199, desc: 'ฟาร์มไอเทมจำลอง 3 ชุด' }
      ],
      'ทำภารกิจ': [
        { name: '5 Missions', price: 109, desc: 'ทำภารกิจจำลอง 5 ภารกิจ' },
        { name: '10 Missions', price: 189, desc: 'ทำภารกิจจำลอง 10 ภารกิจ' }
      ]
    },
    'Minecraft': {
      'ฟาร์มทรัพยากร': [
        { name: '3 Stacks', price: 79, desc: 'เก็บทรัพยากรจำลอง 3 สแต็ก' },
        { name: '10 Stacks', price: 189, desc: 'เก็บทรัพยากรจำลอง 10 สแต็ก' }
      ],
      'สร้างสิ่งปลูกสร้าง': [
        { name: 'Basic Build', price: 149, desc: 'งานก่อสร้างจำลองขนาดเล็ก' },
        { name: 'Large Build', price: 299, desc: 'งานก่อสร้างจำลองขนาดใหญ่' }
      ]
    },
    'Genshin Impact': {
      'ฟาร์มไอเทมและวัตถุดิบ': [
        { name: '200 Materials', price: 139, desc: 'ฟาร์มวัสดุจำลอง 200 ชิ้น' },
        { name: '500 Materials', price: 279, desc: 'ฟาร์มวัสดุจำลอง 500 ชิ้น' }
      ],
      'ทำภารกิจ': [
        { name: '3 Quests', price: 119, desc: 'ทำเควสต์จำลอง 3 ภารกิจ' },
        { name: '8 Quests', price: 249, desc: 'ทำเควสต์จำลอง 8 ภารกิจ' }
      ]
    },
    'Mobile Legends': {
      'ทำภารกิจ': [
        { name: '5 Tasks', price: 99, desc: 'ทำภารกิจจำลอง 5 รายการ' },
        { name: '10 Tasks', price: 179, desc: 'ทำภารกิจจำลอง 10 รายการ' }
      ],
      'ฟาร์มไอเทม': [
        { name: 'Basic Items', price: 109, desc: 'แพ็กเกจไอเทมจำลองระดับเริ่มต้น' },
        { name: 'Premium Items', price: 219, desc: 'แพ็กเกจไอเทมจำลองระดับสูง' }
      ]
    }
  };

  let currentStep = 1;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  function safeStorageGet(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  function safeStorageSet(key, value) {
    try { localStorage.setItem(key, value); return true; } catch { return false; }
  }

  function getOrders() {
    try {
      const raw = localStorage.getItem('gfOrders');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }

  function updateProgress(step) {
    indicators.forEach((item) => {
      const number = Number(item.dataset.stepIndicator);
      item.classList.toggle('active', number === step);
      item.classList.toggle('complete', number < step);
    });
  }

  function setStep(step) {
    currentStep = step;
    panels.forEach((panel) => {
      const isActive = Number(panel.dataset.step) === step;
      panel.hidden = !isActive;
      panel.classList.toggle('active', isActive);
    });
    updateProgress(step);
    window.scrollTo({ top: document.querySelector('.order-section')?.offsetTop || 0, behavior: 'smooth' });
  }

  function fillServiceOptions(game, preferredService = '') {
    serviceSelect.innerHTML = '';
    serviceSelect.disabled = true;
    packageSelect.innerHTML = '<option value="">— เลือกบริการก่อน —</option>';
    packageSelect.disabled = true;
    packagePreview.hidden = true;

    if (!game || !SERVICE_DATA[game]) {
      serviceSelect.innerHTML = '<option value="">— เลือกเกมก่อน —</option>';
      return;
    }

    const services = Object.keys(SERVICE_DATA[game]);
    serviceSelect.innerHTML = '<option value="">— เลือกบริการ —</option>' + services.map((service) => `<option value="${escapeHtml(service)}">${escapeHtml(service)}</option>`).join('');
    serviceSelect.disabled = false;

    if (preferredService && services.includes(preferredService)) {
      serviceSelect.value = preferredService;
      fillPackageOptions(game, preferredService);
    }
  }

  function fillPackageOptions(game, service) {
    packageSelect.innerHTML = '<option value="">— เลือกแพ็กเกจ —</option>';
    packageSelect.disabled = true;
    packagePreview.hidden = true;
    const packages = SERVICE_DATA[game]?.[service] || [];
    packages.forEach((item, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = `${item.name} — ${item.price.toLocaleString('th-TH')} บาท`;
      packageSelect.appendChild(option);
    });
    packageSelect.disabled = packages.length === 0;
    if (packages.length === 1) {
      packageSelect.value = '0';
      updatePackagePreview();
    }
  }

  function updatePackagePreview() {
    const game = gameSelect.value;
    const service = serviceSelect.value;
    const index = Number(packageSelect.value);
    const item = SERVICE_DATA[game]?.[service]?.[index];
    if (!item) {
      packagePreview.hidden = true;
      return;
    }
    document.getElementById('packagePreviewName').textContent = item.name;
    document.getElementById('packagePreviewDescription').textContent = item.desc;
    document.getElementById('packagePreviewPrice').textContent = `${item.price.toLocaleString('th-TH')} บาท`;
    packagePreview.hidden = false;
  }

  function getCurrentSelection() {
    const game = gameSelect.value;
    const service = serviceSelect.value;
    const index = Number(packageSelect.value);
    const pkg = SERVICE_DATA[game]?.[service]?.[index];
    return pkg ? { game, service, packageName: pkg.name, price: pkg.price, packageDescription: pkg.desc } : null;
  }

  function validateField(field) {
    const invalid = !field.checkValidity();
    field.setAttribute('aria-invalid', invalid ? 'true' : 'false');
    return !invalid;
  }

  function validateSelection() {
    const ok = validateField(gameSelect) & validateField(serviceSelect) & validateField(packageSelect);
    if (!ok || !getCurrentSelection()) {
      showToast('กรุณาเลือกเกม บริการ และแพ็กเกจให้ครบก่อนครับ');
      return false;
    }
    return true;
  }

  function validateInfo() {
    const required = ['playerName', 'gameUserId', 'contact'].map((id) => document.getElementById(id));
    let ok = true;
    required.forEach((field) => { if (!validateField(field)) ok = false; });
    if (!ok) showToast('กรุณากรอกข้อมูลที่จำเป็นให้ครบครับ');
    return ok;
  }

  function buildReview() {
    const selection = getCurrentSelection();
    if (!selection) return false;
    document.getElementById('reviewGame').textContent = selection.game;
    document.getElementById('reviewService').textContent = selection.service;
    document.getElementById('reviewPackage').textContent = selection.packageName;
    document.getElementById('reviewTime').textContent = document.getElementById('preferredTime').value || 'ไม่ระบุ';
    document.getElementById('reviewPlayer').textContent = document.getElementById('playerName').value.trim();
    document.getElementById('reviewUserId').textContent = document.getElementById('gameUserId').value.trim();
    document.getElementById('reviewContact').textContent = document.getElementById('contact').value.trim();
    document.getElementById('reviewDetails').textContent = document.getElementById('orderDetails').value.trim() || 'ไม่ระบุ';
    document.getElementById('reviewPrice').textContent = `${selection.price.toLocaleString('th-TH')} บาท`;
    return true;
  }

  function nextFromSelection() {
    if (!validateSelection()) return;
    setStep(2);
  }

  function nextFromInfo() {
    if (!validateInfo()) return;
    buildReview();
    setStep(3);
  }

  function createOrder() {
    if (!document.getElementById('confirmEducation').checked) {
      showToast('กรุณายืนยันว่าเข้าใจขอบเขตของโครงงานก่อนครับ');
      return;
    }
    const selection = getCurrentSelection();
    if (!selection || !validateInfo()) return;

    const orders = getOrders();
    const orderId = makeOrderId(orders);
    const order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      game: selection.game,
      service: selection.service,
      packageName: selection.packageName,
      packageDescription: selection.packageDescription,
      price: selection.price,
      playerName: document.getElementById('playerName').value.trim(),
      gameUserId: document.getElementById('gameUserId').value.trim(),
      contact: document.getElementById('contact').value.trim(),
      preferredTime: document.getElementById('preferredTime').value || '',
      details: document.getElementById('orderDetails').value.trim(),
      status: 'Process'
    };

    orders.push(order);
    const savedOrders = safeStorageSet('gfOrders', JSON.stringify(orders));
    if (!savedOrders) {
      showToast('บันทึกคำสั่งซื้อไม่ได้ กรุณาตรวจสอบการอนุญาต Local Storage');
      return;
    }
    safeStorageSet('gfLatestOrderId', orderId);
    safeStorageSet('gfSelectedGame', selection.game);
    safeStorageSet('gfSelectedService', selection.service);

    document.getElementById('createdOrderId').textContent = orderId;
    successPanel.hidden = false;
    orderForm.hidden = true;
    document.querySelector('.order-progress').hidden = true;
    successPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function makeOrderId(orders) {
    let max = 10000;
    orders.forEach((order) => {
      const match = /^GF-(\d+)$/.exec(order.id || '');
      if (match) max = Math.max(max, Number(match[1]));
    });
    return `GF-${max + 1}`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
  }

  gameSelect.addEventListener('change', () => fillServiceOptions(gameSelect.value));
  serviceSelect.addEventListener('change', () => fillPackageOptions(gameSelect.value, serviceSelect.value));
  packageSelect.addEventListener('change', updatePackagePreview);
  document.getElementById('nextToInfo').addEventListener('click', nextFromSelection);
  document.getElementById('backToSelection').addEventListener('click', () => setStep(1));
  document.getElementById('nextToReview').addEventListener('click', nextFromInfo);
  document.getElementById('backToInfo').addEventListener('click', () => setStep(2));
  document.getElementById('editSelection').addEventListener('click', () => setStep(1));
  document.getElementById('editInfo').addEventListener('click', () => setStep(2));
  orderForm.addEventListener('submit', (event) => { event.preventDefault(); createOrder(); });
  document.getElementById('copyOrderId').addEventListener('click', async () => {
    const id = document.getElementById('createdOrderId').textContent;
    try {
      await navigator.clipboard.writeText(id);
      showToast('คัดลอก Order ID แล้วครับ');
    } catch {
      showToast(`Order ID: ${id}`);
    }
  });
  document.getElementById('helpButton')?.addEventListener('click', () => showToast('เลือกเกม → บริการ → แพ็กเกจ → กรอกข้อมูล → ตรวจสอบ → ยืนยัน'));

  ['playerName', 'gameUserId', 'contact'].forEach((id) => {
    const field = document.getElementById(id);
    field.addEventListener('input', () => field.removeAttribute('aria-invalid'));
  });

  const savedGame = safeStorageGet('gfSelectedGame');
  const savedService = safeStorageGet('gfSelectedService');
  if (savedGame && SERVICE_DATA[savedGame]) {
    gameSelect.value = savedGame;
    fillServiceOptions(savedGame, savedService || '');
    savedSelection.hidden = false;
  }
});
