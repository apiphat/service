(() => {
  'use strict';
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const error = document.getElementById('authError');
  const success = document.getElementById('authSuccess');

  const readUsers = () => {
    try {
      const raw = localStorage.getItem('gfUsers');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  };

  const saveUsers = (users) => {
    try { localStorage.setItem('gfUsers', JSON.stringify(users)); return true; } catch { return false; }
  };

  const show = (node, message) => {
    if (!node) return;
    node.textContent = message;
    node.classList.add('show');
  };

  const hide = (node) => node?.classList.remove('show');

  loginForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    hide(error); hide(success);
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const user = readUsers().find(item => item.username === username && item.password === password);
    if (!user) {
      show(error, 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้องครับ');
      return;
    }
    try {
      localStorage.setItem('gfCurrentUser', JSON.stringify({ username: user.username, email: user.email, loggedInAt: new Date().toISOString() }));
    } catch {}
    show(success, `เข้าสู่ระบบสำเร็จครับ ยินดีต้อนรับ ${user.username}`);
    window.setTimeout(() => { window.location.href = '../index.html'; }, 900);
  });

  registerForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    hide(error); hide(success);
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim().toLowerCase();
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerConfirm').value;

    if (password !== confirm) {
      show(error, 'รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกันครับ');
      return;
    }
    const users = readUsers();
    if (users.some(item => item.username.toLowerCase() === username.toLowerCase())) {
      show(error, 'ชื่อผู้ใช้นี้มีอยู่แล้วครับ');
      return;
    }
    if (users.some(item => item.email.toLowerCase() === email)) {
      show(error, 'อีเมลนี้มีอยู่แล้วครับ');
      return;
    }
    users.push({ username, email, password, createdAt: new Date().toISOString() });
    if (!saveUsers(users)) {
      show(error, 'ไม่สามารถบันทึกข้อมูลลง Local Storage ได้ครับ');
      return;
    }
    show(success, 'สมัครสมาชิกสำเร็จครับ กำลังพาไปหน้าเข้าสู่ระบบ...');
    window.setTimeout(() => { window.location.href = 'login.html'; }, 900);
  });
})();
