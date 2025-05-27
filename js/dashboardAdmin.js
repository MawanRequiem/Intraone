let semuaData = {};

document.addEventListener("DOMContentLoaded", () => {
  // Cek autentikasi admin terlebih dahulu
  if (!cekAutentikasiAdmin()) {
    // Redirect ke halaman login atau tampilkan pesan error
    alert("Akses ditolak. Silakan login sebagai admin terlebih dahulu.");
    window.location.href = "/login"; // atau halaman login Anda
    return;
  }

  // Jika sudah terautentikasi, lanjutkan dengan memuat data
  muatDataPelanggan();

  // Event listeners untuk filter
  document.getElementById("searchInput").addEventListener("input", filterData);
  document.getElementById("filterKota").addEventListener("change", filterData);
  document.getElementById("filterPaket").addEventListener("change", filterData);
  document.getElementById("filterStatus").addEventListener("change", filterData);
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

function muatDataPelanggan() {
  // Tampilkan loading indicator (opsional)
  const container = document.getElementById("adminCards");
  if (container) {
    container.innerHTML = "<p class='text-slate-400'>Memuat data...</p>";
  }

  fetch("/api/pelanggan")
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      semuaData = data || {};
      isiFilter(data);
      tampilkanData(Object.entries(data));
    })
    .catch(error => {
      console.error("Error loading data:", error);
      if (container) {
        container.innerHTML = "<p class='text-red-400'>Gagal memuat data pelanggan. Silakan refresh halaman.</p>";
      }
    });
}

function isiFilter(data) {
  const kotaSet = new Set();
  const paketSet = new Set();

  Object.values(data).forEach(p => {
    if (p.kota) kotaSet.add(p.kota);
    if (p.paketInternet) paketSet.add(p.paketInternet);
  });

  const filterKota = document.getElementById("filterKota");
  const filterPaket = document.getElementById("filterPaket");

  // Clear existing options (kecuali option pertama)
  if (filterKota) {
    while (filterKota.children.length > 1) {
      filterKota.removeChild(filterKota.lastChild);
    }
  }

  if (filterPaket) {
    while (filterPaket.children.length > 1) {
      filterPaket.removeChild(filterPaket.lastChild);
    }
  }

  kotaSet.forEach(kota => {
    const opt = document.createElement("option");
    opt.value = kota;
    opt.textContent = kota;
    if (filterKota) filterKota.appendChild(opt);
  });

  paketSet.forEach(paket => {
    const opt = document.createElement("option");
    opt.value = paket;
    opt.textContent = paket;
    if (filterPaket) filterPaket.appendChild(opt);
  });
}

function filterData() {
  const searchInput = document.getElementById("searchInput");
  const filterKota = document.getElementById("filterKota");
  const filterPaket = document.getElementById("filterPaket");
  const filterStatus = document.getElementById("filterStatus");

  const query = searchInput ? searchInput.value.toLowerCase() : "";
  const kota = filterKota ? filterKota.value : "";
  const paket = filterPaket ? filterPaket.value : "";
  const status = filterStatus ? filterStatus.value : "";

  const hasil = Object.entries(semuaData).filter(([_, user]) => {
    const cocokNama = user.nama?.toLowerCase().includes(query);
    const cocokKota = !kota || user.kota === kota;
    const cocokPaket = !paket || user.paketInternet === paket;
    const cocokStatus = !status || user.status === status;
    return cocokNama && cocokKota && cocokPaket && cocokStatus;
  });

  tampilkanData(hasil);
}

const statusWarna = {
  "aktif": "text-green-400",
  "pending": "text-yellow-400",
  "tidak aktif": "text-red-400",
  "Request Pembatalan": "text-red-400"
};

function tampilkanData(list) {
  const container = document.getElementById("adminCards");
  if (!container) {
    console.error("Container adminCards tidak ditemukan");
    return;
  }

  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = "<p class='text-slate-400'>Tidak ada data yang cocok.</p>";
    return;
  }

  list.forEach(([id, user]) => {
    const card = document.createElement("div");
    card.className = "glass flex flex-col md:flex-row justify-between items-start gap-6 p-6 rounded-xl border border-sky-500";

    card.innerHTML = `
      <div class="flex-1">
        <h4 class="text-2xl font-bold mb-2">${user.nama || 'Nama tidak tersedia'}</h4>
        <p><strong>Kota:</strong> ${user.kota || '-'}</p>
        <p><strong>Paket:</strong> ${user.paketInternet || '-'}</p>
        <p><strong>Durasi:</strong> ${user.durasiBerlangganan || '-'} bulan</p>
        <p><strong>Total:</strong> ${user.totalHarga || '-'}</p>
        <p><strong>Expiry:</strong> ${user.expiryDate ? new Date(user.expiryDate).toLocaleDateString('id-ID') : '-'}</p>
        <p><strong>Status:</strong> 
          <span class="font-semibold ${statusWarna[user.status] || 'text-slate-300'}">${user.status || 'Tidak diketahui'}</span>
        </p>
      </div>
      <div class="flex gap-2 items-center mt-4 md:mt-0">
        <button class="btn btn-sm btn-gradient w-full md:w-auto" onclick="konfirmasiModal('aktifkan', '${id}')">Aktifkan</button>
        <button class="btn btn-sm btn-danger w-full md:w-auto" onclick="konfirmasiModal('hapus', '${id}')">Hapus</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function updateStatus(id, status) {
  // Cek ulang autentikasi sebelum melakukan update
  if (!cekAutentikasiAdmin()) {
    alert("Sesi admin telah berakhir. Silakan login kembali.");
    window.location.href = "/login";
    return;
  }

  const adminId = localStorage.getItem('adminId');
  
  fetch(`/api/pelanggan/${id}`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      "X-Admin-ID": adminId // Kirim admin ID sebagai header untuk verifikasi
    },
    body: JSON.stringify({ status })
  })
    .then(res => {
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Tidak memiliki akses untuk melakukan operasi ini");
        }
        throw new Error("Gagal update status");
      }
      return res.json();
    })
    .then(() => {
      alert("Status berhasil diupdate!");
      location.reload();
    })
    .catch(error => {
      console.error("Error:", error);
      alert(error.message || "Gagal update status");
    });
}

function hapusPelanggan(id) {
  // Cek ulang autentikasi sebelum melakukan hapus
  if (!cekAutentikasiAdmin()) {
    alert("Sesi admin telah berakhir. Silakan login kembali.");
    window.location.href = "/login";
    return;
  }

  if (!confirm("Yakin ingin menghapus pelanggan ini?")) return;

  const adminId = localStorage.getItem('adminId');

  fetch(`/api/pelanggan/${id}`, { 
    method: "DELETE",
    headers: {
      "X-Admin-ID": adminId // Kirim admin ID sebagai header untuk verifikasi
    }
  })
    .then(res => {
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Tidak memiliki akses untuk melakukan operasi ini");
        }
        throw new Error("Gagal hapus data");
      }
      return res.json();
    })
    .then(() => {
      alert("Pelanggan berhasil dihapus");
      location.reload();
    })
    .catch(error => {
      console.error("Error:", error);
      alert(error.message || "Gagal menghapus pelanggan");
    });
}

function konfirmasiModal(aksi, id) {
  // Cek autentikasi sebelum menampilkan modal
  if (!cekAutentikasiAdmin()) {
    alert("Sesi admin telah berakhir. Silakan login kembali.");
    window.location.href = "/login";
    return;
  }

  selectedAction = aksi;
  selectedId = id;

  const modal = document.getElementById("confirmModal");
  const modalTitle = document.getElementById("confirmModalTitle");
  const modalBody = document.getElementById("confirmModalBody");

  if (!modal || !modalTitle || !modalBody) {
    console.error("Elemen modal tidak ditemukan");
    return;
  }

  const modalHeader = document.querySelector("#confirmModal .modal-header");
  const modalContent = document.querySelector("#confirmModal .modal-content");
  const modalBodyText = document.querySelector("#confirmModal .modal-body");
  const confirmButton = document.getElementById("confirmModalOk");

  if (!modalHeader || !modalContent || !modalBodyText || !confirmButton) {
    console.error("Elemen modal tidak lengkap");
    return;
  }

  // Reset kelas dulu
  modalHeader.classList.remove("bg-sky-900", "bg-red-800");
  modalContent.classList.remove("border-sky-700", "border-red-700");
  modalBodyText.classList.remove("text-slate-300", "text-red-200");
  confirmButton.classList.remove("btn-gradient", "bg-red-700", "hover:bg-red-800", "text-white");

  // Set konten dan gaya berdasarkan aksi
  if (aksi === "aktifkan") {
    modalTitle.textContent = "Konfirmasi Aktifkan Langganan";
    modalBody.textContent = "Apakah Anda yakin ingin mengaktifkan pelanggan ini?";

    modalHeader.classList.add("bg-sky-900");
    modalContent.classList.add("border-sky-700");
    modalBodyText.classList.add("text-slate-300");

    confirmButton.textContent = "Ya, Aktifkan";
    confirmButton.classList.add("btn-gradient");
  } else if (aksi === "hapus") {
    modalTitle.textContent = "Konfirmasi Hapus Pelanggan";
    modalBody.textContent = "Apakah Anda yakin ingin menghapus pelanggan ini? Tindakan ini tidak dapat dibatalkan.";

    modalHeader.classList.add("bg-red-800");
    modalContent.classList.add("border-red-700");
    modalBodyText.classList.add("text-red-200");

    confirmButton.textContent = "Ya, Hapus";
    confirmButton.classList.add("bg-red-700", "hover:bg-red-800", "text-white");
  }

  // Tampilkan modal
  if (typeof bootstrap !== 'undefined') {
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
  } else {
    modal.style.display = 'block';
  }

  // Set event handler untuk tombol konfirmasi
  confirmButton.onclick = () => {
    if (selectedAction === "aktifkan") {
      updateStatus(selectedId, "aktif");
    } else if (selectedAction === "hapus") {
      hapusPelanggan(selectedId);
    }
  };
}

// Fungsi tambahan untuk logout admin
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
      <span class="text-slate-300">Admin: ${adminEmail}</span>
      <button onclick="logoutAdmin()" class="ml-4 text-red-400 hover:text-red-300">Logout</button>
    `;
  }
}