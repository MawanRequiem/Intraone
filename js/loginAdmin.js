document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginAdminForm');
  const emailInput = document.getElementById('emailAdminLogin');
  const passwordInput = document.getElementById('passwordAdminLogin');
  const loginMessage = document.getElementById('loginAdminMessage');

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await res.json();

      if (res.ok && result.success) {
        loginMessage.textContent = 'Login admin berhasil!';
        loginMessage.classList.add('text-green-400');
        loginMessage.classList.remove('text-red-400');

        // Simpan data admin
        localStorage.setItem('adminEmail', result.admin.email);
        localStorage.setItem('adminId', result.admin.id);

        // Redirect ke dashboard admin
        window.location.href = 'dashboardAdmin.html';
      } else {
        throw new Error(result.message || 'Login gagal');
      }
    } catch (err) {
      loginMessage.textContent = err.message;
      loginMessage.classList.add('text-red-400');
      loginMessage.classList.remove('text-green-400');
    }
  });
});
