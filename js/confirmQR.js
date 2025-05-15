document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem('konfirmasiData'));
  if (!data) {
    alert("Data tidak ditemukan, silakan mulai ulang proses pembayaran.");
    return window.location.href = data?.jenisPembayaran === "upgrade"
      ? "upgradepaket.html"
      : "payment.html";
  }

  // Update judul halaman sesuai jenis
  const heading = document.querySelector("h2") || document.querySelector("h3");
  if (heading) {
    heading.textContent = data.jenisPembayaran === "upgrade"
      ? "Konfirmasi Pembayaran Upgrade"
      : "Konfirmasi Pembayaran Perpanjangan";
  }

  // Tampilkan paket & harga
  document.getElementById("paket").textContent = data.paket;
  document.getElementById("harga").textContent = data.harga;

  // Timer countdown 2 menit
  let timeLeft = 2 * 60;
  const timerEl = document.getElementById("timer");
  const countdown = setInterval(() => {
    const m = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const s = String(timeLeft % 60).padStart(2, "0");
    if (timerEl) timerEl.textContent = `${m}:${s}`;
    if (timeLeft <= 0) {
      clearInterval(countdown);
      document.getElementById("modal-gagal")?.classList.remove("hidden");
    }
    timeLeft--;
  }, 1000);
});

function batalkanPembayaran() {
  if (confirm("Yakin ingin membatalkan pembayaran?")) {
    const data = JSON.parse(localStorage.getItem('konfirmasiData')) || {};
    // Redirect sesuai jenis
    window.location.href = data.jenisPembayaran === "upgrade"
      ? "paymentupgrade.html"
      : "payment.html";
  }
}

async function konfirmasiPembayaran() {
  const data = JSON.parse(localStorage.getItem('konfirmasiData'));
  const userId = localStorage.getItem('userId');
  if (!data || !userId) {
    alert("Data tidak lengkap. Harap login ulang.");
    return;
  }

  // Siapkan payload transaksi
  const transaksiBaru = {
    userId,
    tanggal: new Date().toISOString(),
    jenis: data.jenisPembayaran === "upgrade" ? "Upgrade" : "Perpanjangan",
    paket: data.paket,
    durasi: data.durasiInt,
    total: Number(data.harga.replace(/[^\d]/g, "")),
    metode: data.metode
  };
  
  console.log("Mengirim update paketInternet:", data.paket);

  try {
    // 1) Simpan ke histori transaksi
    const res = await fetch("/api/transaksi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaksiBaru)
    });
    if (!res.ok) throw new Error("Gagal menyimpan transaksi.");

    // 2) Update masa langganan
    const upd = await fetch(`/api/pelanggan/${userId}/langganan`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durasi: transaksiBaru.durasi })
    });
    if (!upd.ok) throw new Error("Gagal memperbarui masa langganan.");


    const paketYangAkanDisimpan = data?.paket || "Paket Default";
    console.log("Menyimpan paketInternet:", paketYangAkanDisimpan);


    if (data.jenisPembayaran === "upgrade") {
      const resUpdPaket = await fetch(`/api/pelanggan/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paketInternet: paketYangAkanDisimpan, totalHarga: data.harga, durasiBerlangganan: data.durasiInt})
      });
    }

    alert(`Transaksi berhasil & langganan ${data.jenisPembayaran === "upgrade" ? "di-upgrade" : "diperpanjang"}.`);
    localStorage.removeItem("konfirmasiData");
    window.location.href = "dashboard.html";

  } catch (err) {
    console.error(err);
    alert("Gagal memproses pembayaran. Silakan coba lagi.");
  }
}
