document.addEventListener("DOMContentLoaded", () => {
    const data = JSON.parse(localStorage.getItem('konfirmasiData'));
    if (data) {
      document.getElementById("paket").textContent = data.paket;
      document.getElementById("harga").textContent = data.harga;
    }
  
    // Generate dan tampilkan kode VA
    const kodeVA = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');
    document.getElementById("kodeVA").textContent = kodeVA;
  
    // Timer countdown 30 menit
    let timeLeft = 30 * 60;
    const timerEl = document.getElementById("timer");
  
    const countdown = setInterval(() => {
      let m = Math.floor(timeLeft / 60);
      let s = timeLeft % 60;
      timerEl.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      if (timeLeft <= 0) {
        clearInterval(countdown);
        document.getElementById("modal-gagal").classList.remove("hidden");
      }
      timeLeft--;
    }, 1000);
  });
  
  function salinVA() {
    const kode = document.getElementById("kodeVA").textContent;
    navigator.clipboard.writeText(kode);
    alert("Kode VA disalin!");
  }
  
  function batalkanPembayaran() {
    const confirmCancel = confirm("Yakin ingin membatalkan pembayaran?");
    if (confirmCancel) {
      window.location.href = "payment.html";
    }
  }
  
  function konfirmasiPembayaran() {
    const data = JSON.parse(localStorage.getItem('konfirmasiData'));
    const userId = localStorage.getItem('userId');
  
    if (!data || !userId) {
      alert("Data tidak lengkap. Harap login ulang.");
      return;
    }
  
    const transaksiBaru = {
      userId: userId,
      tanggal: new Date().toISOString(),
      jenis: "Perpanjangan",
      paket: data.paket,
      durasi: data.durasiInt || 1,
      total: data.harga.replace(/[^\d]/g, ""),
      metode: "Virtual Account"
    };
  
    fetch("/api/transaksi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(transaksiBaru)
    })
      .then(res => {
        if (!res.ok) throw new Error("Gagal menyimpan transaksi.");
        return res.json();
      })
      .then(() => {
        return fetch(`/api/pelanggan/${userId}/langganan`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ durasi: transaksiBaru.durasi })
        });
      })
      .then(res => {
        if (!res.ok) throw new Error("Gagal memperbarui masa langganan.");
        return res.json();
      })
      .then(() => {
        alert("Transaksi Berhasil & langganan diperpanjang.");
        localStorage.removeItem("konfirmasiData");
        window.location.href = "dashboard.html";
      })
      .catch(err => {
        console.error("Error:", err);
        alert("Gagal menyimpan transaksi atau memperbarui langganan.");
      });
  }