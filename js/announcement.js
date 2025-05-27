// Variabel global untuk form dan elemen
const form = document.getElementById('announcementForm');
const listDiv = document.getElementById('announcementList');
const searchInput = document.getElementById('searchInput');

// Cek autentikasi saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  // Cek autentikasi admin terlebih dahulu
  if (!cekAutentikasiAdmin()) {
    // Redirect ke halaman login atau tampilkan pesan error
    alert("Akses ditolak. Silakan login sebagai admin terlebih dahulu.");
    window.location.href = "/login"; // atau halaman login Anda
    return;
  }

  // Jika sudah terautentikasi, lanjutkan dengan setup halaman
  initializeAnnouncementPage();
});

function cekAutentikasiAdmin() {
  const adminEmail = localStorage.getItem('adminEmail');
  const adminId = localStorage.getItem('adminId');
  
  // Cek apakah data admin ada di localStorage
  if (!adminEmail || !adminId) {
    console.log("Data admin tidak ditemukan di localStorage");
    return false;
  }

  // Validasi format email (opsional)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(adminEmail)) {
    console.log("Format email admin tidak valid");
    return false;
  }

  console.log(`Admin terautentikasi: ${adminEmail} (ID: ${adminId})`);
  return true;
}

function initializeAnnouncementPage() {
  // Setup event listeners
  if (form) {
    form.addEventListener('submit', handleSubmitAnnouncement);
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      loadAnnouncements(searchInput.value.toLowerCase());
    });
  }

  // Load announcements pertama kali
  loadAnnouncements();

  // Tampilkan info admin yang sedang login
  tampilkanInfoAdmin();
}

async function handleSubmitAnnouncement(e) {
  e.preventDefault();

  // Cek ulang autentikasi sebelum submit
  if (!cekAutentikasiAdmin()) {
    alert("Sesi admin telah berakhir. Silakan login kembali.");
    window.location.href = "/login";
    return;
  }

  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  const adminId = localStorage.getItem('adminId');

  // Validasi input
  if (!title.trim() || !content.trim()) {
    alert("Judul dan konten pengumuman tidak boleh kosong");
    return;
  }

  try {
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Admin-ID': adminId // Kirim admin ID untuk verifikasi
      },
      body: JSON.stringify({ title, content })
    });

    const result = await res.json();
    
    if (res.ok && result.success) {
      form.reset();
      loadAnnouncements();
      alert("Pengumuman berhasil dibuat!");
    } else {
      if (res.status === 401 || res.status === 403) {
        alert("Tidak memiliki akses untuk membuat pengumuman");
        window.location.href = "/login";
        return;
      }
      alert(result.message || 'Gagal membuat pengumuman');
    }
  } catch (error) {
    console.error('Error creating announcement:', error);
    alert('Terjadi kesalahan saat membuat pengumuman');
  }
}

async function loadAnnouncements(filter = '') {
  // Cek autentikasi sebelum load data
  if (!cekAutentikasiAdmin()) {
    alert("Sesi admin telah berakhir. Silakan login kembali.");
    window.location.href = "/login";
    return;
  }

  if (!listDiv) {
    console.error("Element announcementList tidak ditemukan");
    return;
  }

  try {
    // Tampilkan loading indicator
    listDiv.innerHTML = '<p class="text-slate-400">Memuat pengumuman...</p>';

    const adminId = localStorage.getItem('adminId');
    const res = await fetch('/api/announcements', {
      headers: {
        'X-Admin-ID': adminId // Kirim admin ID untuk verifikasi
      }
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        alert("Tidak memiliki akses untuk melihat pengumuman");
        window.location.href = "/login";
        return;
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const { data } = await res.json();
    listDiv.innerHTML = '';

    if (!data || data.length === 0) {
      listDiv.innerHTML = '<p class="text-slate-400">Belum ada pengumuman.</p>';
      return;
    }

    const filteredData = data.filter(item => 
      item.title.toLowerCase().includes(filter) || 
      item.content.toLowerCase().includes(filter)
    );

    if (filteredData.length === 0) {
      listDiv.innerHTML = '<p class="text-slate-400">Tidak ada pengumuman yang cocok dengan pencarian.</p>';
      return;
    }

    filteredData.forEach(({ id, title, content, date, statusAnnouncement }) => {
      const waktu = new Date(date);
      const tanggalFormatted = waktu.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const jamFormatted = waktu.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const statusBadge = statusAnnouncement === 'aktif'
        ? '<span class="badge bg-success text-white">Aktif</span>'
        : '<span class="badge bg-secondary text-white">Nonaktif</span>';

      const card = document.createElement('div');
      card.className = 'glass p-6 rounded-xl border border-sky-500 mb-4';

      card.innerHTML = `
        <div class="flex flex-col space-y-2">
          <h4 class="text-2xl font-bold">${escapeHtml(title)}</h4>
          <p class="text-slate-200">${escapeHtml(content)}</p>
          <small class="text-sm text-slate-400">Dibuat pada ${tanggalFormatted} pukul ${jamFormatted} WIB</small>
          <div>Status: ${statusBadge}</div>
          <div class="flex justify-between mt-2">
            <button onclick="toggleStatus('${id}', '${statusAnnouncement}')" class="btn btn-sm btn-warning">Ubah Status</button>
            <button onclick="confirmDeleteAnnouncement('${id}')" class="btn btn-sm btn-danger">Hapus</button>
          </div>
        </div>
      `;

      listDiv.appendChild(card);
    });

  } catch (error) {
    console.error('Error loading announcements:', error);
    listDiv.innerHTML = '<p class="text-red-400">Gagal memuat pengumuman. Silakan refresh halaman.</p>';
  }
}

async function toggleStatus(id, currentStatus) {
  // Cek autentikasi sebelum mengubah status
  if (!cekAutentikasiAdmin()) {
    alert("Sesi admin telah berakhir. Silakan login kembali.");
    window.location.href = "/login";
    return;
  }

  const newStatus = currentStatus === 'aktif' ? 'nonaktif' : 'aktif';
  const adminId = localStorage.getItem('adminId');

  try {
    const res = await fetch(`/api/announcements/${id}/statusAnnouncement`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'X-Admin-ID': adminId // Kirim admin ID untuk verifikasi
      },
      body: JSON.stringify({ statusAnnouncement: newStatus })
    });

    const result = await res.json();
    
    if (res.ok && result.success) {
      loadAnnouncements();
      alert(`Status pengumuman berhasil diubah menjadi ${newStatus}`);
    } else {
      if (res.status === 401 || res.status === 403) {
        alert("Tidak memiliki akses untuk mengubah status pengumuman");
        window.location.href = "/login";
        return;
      }
      alert(result.message || 'Gagal mengubah status');
    }
  } catch (error) {
    console.error('Error toggling status:', error);
    alert('Terjadi kesalahan saat mengubah status');
  }
}

function confirmDeleteAnnouncement(id) {
  // Cek autentikasi sebelum menampilkan konfirmasi
  if (!cekAutentikasiAdmin()) {
    alert("Sesi admin telah berakhir. Silakan login kembali.");
    window.location.href = "/login";
    return;
  }

  const confirmed = confirm('Yakin ingin menghapus pengumuman ini? Tindakan ini tidak dapat dibatalkan.');
  if (confirmed) {
    deleteAnnouncement(id);
  }
}

async function deleteAnnouncement(id) {
  const adminId = localStorage.getItem('adminId');

  try {
    const res = await fetch(`/api/announcements/${id}`, { 
      method: 'DELETE',
      headers: {
        'X-Admin-ID': adminId // Kirim admin ID untuk verifikasi
      }
    });

    const result = await res.json();
    
    if (res.ok && result.success) {
      loadAnnouncements();
      alert('Pengumuman berhasil dihapus');
    } else {
      if (res.status === 401 || res.status === 403) {
        alert("Tidak memiliki akses untuk menghapus pengumuman");
        window.location.href = "/login";
        return;
      }
      alert(result.message || 'Gagal menghapus pengumuman');
    }
  } catch (error) {
    console.error('Error deleting announcement:', error);
    alert('Terjadi kesalahan saat menghapus pengumuman');
  }
}

// Fungsi untuk logout admin
function logoutAdmin() {
  localStorage.removeItem('adminEmail');
  localStorage.removeItem('adminId');
  alert("Anda telah logout dari dashboard admin");
  window.location.href = "/login";
}

// Fungsi untuk menampilkan info admin yang sedang login
function tampilkanInfoAdmin() {
  const adminEmail = localStorage.getItem('adminEmail');
  const adminInfo = document.getElementById('adminInfo');
  
  if (adminInfo && adminEmail) {
    adminInfo.innerHTML = `
      <div class="flex items-center justify-between mb-4 p-4 bg-slate-800 rounded-lg">
        <span class="text-slate-300">Admin: ${adminEmail}</span>
        <button onclick="logoutAdmin()" class="btn btn-sm bg-red-600 hover:bg-red-700 text-white">Logout</button>
      </div>
    `;
  }
}

// Fungsi utility untuk escape HTML (mencegah XSS)
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}