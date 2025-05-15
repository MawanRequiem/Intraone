document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const emailLogin = document.getElementById('emailLogin');
  const phoneLogin = document.getElementById('phoneLogin');
  const loginMessage = document.getElementById('loginMessage');

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const emailInput = emailLogin.value.trim();
    const phoneInput = phoneLogin.value.trim();

    try {
      const res = await fetch('/api/pelanggan/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, noHP: phoneInput })
      });

      const result = await res.json();

      if (res.ok) {
        loginMessage.textContent = 'Login berhasil!';
        loginMessage.classList.add('text-green-400');
        loginMessage.classList.remove('text-red-400');

        localStorage.setItem('userEmail', result.data.email);
        localStorage.setItem('userPhone', result.data.noHP);
        localStorage.setItem('userId', result.id);

        window.location.href = 'dashboard.html';
      } else {
        throw new Error(result.error || 'Gagal login');
      }
    } catch (err) {
      loginMessage.textContent = err.message;
      loginMessage.classList.add('text-red-400');
      loginMessage.classList.remove('text-green-400');
    }
  });
});