let semuaData = {};

    document.addEventListener("DOMContentLoaded", () => {
      fetch("/api/pelanggan")
        .then(res => res.json())
        .then(data => {
          semuaData = data || {};
          isiFilter(data);
          tampilkanData(Object.entries(data));
        });

      document.getElementById("searchInput").addEventListener("input", filterData);
      document.getElementById("filterKota").addEventListener("change", filterData);
      document.getElementById("filterPaket").addEventListener("change", filterData);
      document.getElementById("filterStatus").addEventListener("change", filterData);
    });

    function isiFilter(data) {
      const kotaSet = new Set();
      const paketSet = new Set();

      Object.values(data).forEach(p => {
        if (p.kota) kotaSet.add(p.kota);
        if (p.paketInternet) paketSet.add(p.paketInternet);
      });

      kotaSet.forEach(kota => {
        const opt = document.createElement("option");
        opt.value = kota;
        opt.textContent = kota;
        filterKota.appendChild(opt);
      });

      paketSet.forEach(paket => {
        const opt = document.createElement("option");
        opt.value = paket;
        opt.textContent = paket;
        filterPaket.appendChild(opt);
      });
    }

    function filterData() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const kota = document.getElementById("filterKota").value;
  const paket = document.getElementById("filterPaket").value;
  const status = document.getElementById("filterStatus").value;

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
            <h4 class="text-2xl font-bold mb-2">${user.nama}</h4>
            <p><strong>Kota:</strong> ${user.kota || '-'}</p>
            <p><strong>Paket:</strong> ${user.paketInternet}</p>
            <p><strong>Durasi:</strong> ${user.durasiBerlangganan} bulan</p>
            <p><strong>Total:</strong> ${user.totalHarga || '-'}</p>
            <p><strong>Expiry:</strong> ${new Date(user.expiryDate).toLocaleDateString('id-ID')}</p>
            <p><strong>Status:</strong> 
              <span class="font-semibold ${statusWarna[user.status] || 'text-slate-300'}">${user.status}</span>
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
      fetch(`/api/pelanggan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })
        .then(res => {
          if (!res.ok) throw new Error("Gagal update status");
          alert("Status berhasil diupdate!");
          location.reload();
        })
        .catch(() => alert("Gagal update status"));
    }

    function hapusPelanggan(id) {
      if (!confirm("Yakin ingin menghapus pelanggan ini?")) return;

      fetch(`/api/pelanggan/${id}`, { method: "DELETE" })
        .then(res => {
          if (!res.ok) throw new Error("Gagal hapus data");
          alert("Pelanggan berhasil dihapus");
          location.reload();
        })
        .catch(() => alert("Gagal menghapus pelanggan"));
    }

    function konfirmasiModal(aksi, id) {
  selectedAction = aksi;
  selectedId = id;

  const modalTitle = document.getElementById("confirmModalTitle");
  const modalBody = document.getElementById("confirmModalBody");

  const modalHeader = document.querySelector("#confirmModal .modal-header");
  const modalContent = document.querySelector("#confirmModal .modal-content");
  const modalBodyText = document.querySelector("#confirmModal .modal-body");
  const confirmButton = document.getElementById("confirmModalOk");

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
    confirmButton.classList.add("btn-gradient"); // biru seperti biasa
  } else if (aksi === "hapus") {
    modalTitle.textContent = "Konfirmasi Hapus Pelanggan";
    modalBody.textContent = "Apakah Anda yakin ingin menghapus pelanggan ini? Tindakan ini tidak dapat dibatalkan.";

    modalHeader.classList.add("bg-red-800");
    modalContent.classList.add("border-red-700");
    modalBodyText.classList.add("text-red-200");

    confirmButton.textContent = "Ya, Hapus";
    confirmButton.classList.add("bg-red-700", "hover:bg-red-800", "text-white");
  }

  const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
  modal.show();

  document.getElementById("confirmModalOk").onclick = () => {
    if (selectedAction === "aktifkan") {
      updateStatus(selectedId, "aktif");
    } else if (selectedAction === "hapus") {
      hapusPelanggan(selectedId);
    }
  };
}