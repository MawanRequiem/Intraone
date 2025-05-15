AOS.init({ duration: 1000, once: true });

// Ambil userId dari localStorage (setelah login berhasil)
const userId = localStorage.getItem('userId');
if (!userId) {
  // Jika belum login, arahkan ke halaman login
  window.location.href = 'login.html';
}

async function getFirebaseServerTime() {
    const response = await fetch("https://worldtimeapi.org/api/timezone/Asia/Jakarta"); // alternatif bebas API
    const data = await response.json();
    return new Date(data.datetime);
  }
  

let currentUser = null;

// 1) Ambil data profil pelanggan
fetch(`/api/pelanggan/${userId}`)
  .then(res => {
    if (!res.ok) throw new Error('Gagal fetch data pelanggan');
    return res.json();
  })
  .then(user => {
    currentUser = user;
  
    document.getElementById('userName').textContent = user.nama;
    document.getElementById('paketInternet').textContent = user.paketInternet;
    document.getElementById('durasiBerlangganan').textContent = user.durasiBerlangganan;
    document.getElementById('totalHarga').textContent = (user.totalHarga).toLocaleString('id-ID');
    document.getElementById('expiryDate').textContent = formatWaktuIndonesia(user.expiryDate);
  
    // Ambil waktu dari server
   fetch('/api/now')
  .then(res => {
    if (!res.ok) throw new Error('Gagal ambil waktu server');
    return res.json();
  })
  .then(data => {
    const sekarang = new Date(data.now);
    const expiry = new Date(user.expiryDate);
    const statusEl = document.getElementById('statusPaket');

    // Cek jika status pending → tampilkan langsung, tidak hitung expiry
    if (user.status === "pending") {
      statusEl.textContent = "Pending";
      statusEl.classList.remove("text-green-400", "text-red-500");
      statusEl.classList.add("text-yellow-400");
      return; // keluar dari proses
    }

    // Jika bukan pending, lanjutkan perbandingan expiry
    if (expiry > sekarang) {
      statusEl.textContent = "Aktif";
      statusEl.classList.remove("text-red-500", "text-yellow-400");
      statusEl.classList.add("text-green-400");
    } else {
      statusEl.textContent = "Tidak Aktif";
      statusEl.classList.remove("text-green-400", "text-yellow-400");
      statusEl.classList.add("text-red-500");
    }
  })
  .catch(err => console.error('Gagal ambil waktu server:', err));
  })
  
  
// 2) Ambil histori transaksi pelanggan
fetch(`/api/transaksi/${userId}`)
  .then(res => {
    if (!res.ok) throw new Error('Gagal fetch histori transaksi');
    return res.json();
  })
  .then(history => {
    const historyTable = document.getElementById('historyTable');
    if (history.length === 0) {
      historyTable.innerHTML = `<tr>
        <td colspan="5" class="text-center text-slate-400">
          Belum ada transaksi
        </td>
      </tr>`;
      return;
    }

    // Urutkan histori dari yang terbaru
    history.sort((a, b) =>
      new Date(b.tanggalTransaksi) - new Date(a.tanggalTransaksi)
    );

    // Tampilkan baris transaksi
    historyTable.innerHTML = '';
    history.forEach(tx => {
      historyTable.innerHTML += `
        <tr>
          <td>${new Date(tx.tanggal).toLocaleDateString('id-ID')}</td>
          <td>${tx.jenis}</td>
          <td>${tx.paket}</td>
          <td>${tx.durasi} bulan</td>
          <td>Rp ${Number(tx.total).toLocaleString('id-ID')}</td>
        </tr>`;
    });
  })
  .catch(err => console.error('Error ambil histori transaksi:', err));

  function formatWaktuIndonesia(isoString) {
    if (!isoString) return "-";
  
    const tanggal = new Date(isoString);
    if (isNaN(tanggal)) return "Tanggal tidak valid";
  
    // Konversi ke zona waktu Indonesia (WIB)
    const options = {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
  
    const formatter = new Intl.DateTimeFormat("id-ID", options);
    return formatter.format(tanggal) + " WIB";
  }
  
  function bukaModalPerpanjang() {
    if (!currentUser) {
      console.error('Data user belum tersedia');
      return;
    }
  
    document.getElementById('paketKonfirmasiPerpanjang').textContent = currentUser.paketInternet;
    document.getElementById('durasiKonfirmasiPerpanjang').textContent = currentUser.durasiBerlangganan + ' bulan';
    document.getElementById('hargaKonfirmasiPerpanjang').textContent = currentUser.totalHarga.toLocaleString('id-ID');
  
    const perpanjangModal = new bootstrap.Modal(document.getElementById('perpanjangModal'));
    perpanjangModal.show();
  }
  
  function prosesPerpanjang() {
    window.location.href = 'payment.html';
  }

  function bukaModalUpgrade() {
    if (!currentUser) {
        console.error('Data user belum tersedia');
        return;
      }

    document.getElementById('paketKonfirmasiUpgrade').textContent = currentUser.paketInternet;
    document.getElementById('durasiKonfirmasiUpgrade').textContent = currentUser.durasiBerlangganan + ' bulan';
    document.getElementById('hargaKonfirmasiUpgrade').textContent = currentUser.totalHarga.toLocaleString('id-ID');

    // Buka modal Bootstrap
    const upgradeModal = new bootstrap.Modal(document.getElementById('upgradeModal'));
    upgradeModal.show();
  }  

  
  function prosesUpgrade() {

    // Redirect ke halaman upgrade
    window.location.href = 'upgradepaket.html';
  }

  function batalkanPaket() {
    // Isi info paket di modal
    document.getElementById('paketBatalkan').textContent = currentUser.paketInternet;

    // Buka modal Bootstrap
    const batalkanModal = new bootstrap.Modal(document.getElementById('batalkanModal'));
    batalkanModal.show();
  }


    async function prosesBatalkan() {
      const response = await fetch(`/api/pelanggan/${userId}`, {
        method: 'DELETE',
      });
    
      const data = await response.json();
      if (response.ok) {
            // Hapus data login
    localStorage.removeItem('userId');

    // Arahkan ke halaman login
    window.location.href = 'login.html';
        alert('Pelanggan berhasil dihapus.');
      } else {
        alert('Gagal menghapus: ' + data.error);
      }
    }

    document.getElementById('logoutButton').addEventListener('click', function (e) {
      e.preventDefault();
      if (confirm('Apakah Anda yakin ingin keluar?')) {
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPhone');
        window.location.href = 'login.html';
      }
    });
  
    // Konfirmasi Logout - Mobile
    document.getElementById('logoutButtonMobile').addEventListener('click', function (e) {
      e.preventDefault();
      if (confirm('Apakah Anda yakin ingin keluar?')) {
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPhone');
        window.location.href = 'login.html';
      }
    });