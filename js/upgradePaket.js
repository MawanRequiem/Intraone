AOS.init({ duration: 1000 });

const userId = localStorage.getItem('userId');
if (!userId) {
  window.location.href = 'login.html';
}

let currentUser = null;

// Ambil elemen
const paketSelect      = document.getElementById('paketBaru');
const durasiInput      = document.getElementById('durasiBaru');
const totalBayarSpan   = document.getElementById('totalBayar');

// Ambil data user dari server
fetch(`/api/pelanggan/${userId}`)
  .then(res => {
    if (!res.ok) throw new Error('Gagal ambil data user');
    return res.json();
  })
  .then(user => {
    currentUser = user;
    updateTotalBayar(); // ✅ Jalankan pertama kali saat user data masuk
  })
  .catch(err => console.error('Gagal fetch data:', err));

// Hitung total bayar dari pilihan paket dan durasi
function updateTotalBayar() {
  const selectedOption = paketSelect.options[paketSelect.selectedIndex];
  const harga = parseInt(selectedOption.getAttribute('data-harga') || 0);
  const durasi = parseInt(durasiInput.value) || 1;
  const total = harga * durasi;

  totalBayarSpan.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

// Dengarkan perubahan paket atau durasi
paketSelect.addEventListener('change', updateTotalBayar);
durasiInput.addEventListener('input', updateTotalBayar);

// Kirim data upgrade sementara ke server
async function prosesUpgrade() {
  const paketBaru = paketSelect.value;
  const durasiBaru = parseInt(durasiInput.value, 10) || 1;

  const totalText  = totalBayarSpan.textContent || '';
  const totalBayar = parseInt(totalText.replace(/[^\d]/g, ''), 10) || 0;

  if (!paketBaru) {
    return alert('Silakan pilih paket terlebih dahulu!');
  }

  const tempData = {
    userId: currentUser.id,
    tanggal: new Date().toISOString(),
    jenis: "Upgrade",
    paket: paketBaru,
    durasi: durasiBaru,
    total: totalBayar
  };

  try {
    const res = await fetch('/api/tempTransaksi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tempData)
    });

    const body = await res.json();
    if (!res.ok) throw new Error(body.error);

    // Redirect ke halaman payment dengan ID transaksi sementara
    window.location.href = `paymentupgrade.html?tempId=${body.tempId}`;
  } catch (err) {
    console.error(err);
    alert('Gagal simpan data upgrade, coba lagi');
  }
}