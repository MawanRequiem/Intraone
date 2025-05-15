AOS.init({ duration: 1000 });

// Ambil userId dari localStorage
const userId = localStorage.getItem('userId');
if (!userId) {
  // Jika userId tidak ada, arahkan ke login
  window.location.href = 'login.html';
}

let currentUser = null;
let selectedMethod = null;

// Ambil elemen tombol bayar sekarang
const bayarBtn = document.getElementById("btnBayar");

// Fungsi ambil data user dan tampilkan
fetch(`/api/pelanggan/${userId}`)
  .then(res => {
    if (!res.ok) throw new Error('Gagal ambil data user');
    return res.json();
  })
  .then(user => {
    currentUser = user;

    // Tampilkan data ke elemen yang sesuai di payment.html
    document.getElementById('paket').textContent = user.paketInternet;
    document.getElementById('durasi').textContent = user.durasiBerlangganan + ' bulan';
    document.getElementById('harga').textContent = user.totalHarga.toLocaleString('id-ID');

    const paymentPrices = document.querySelectorAll('#payment-methods .text-gray-600');
    paymentPrices.forEach(el => {
      el.textContent = user.totalHarga.toLocaleString('id-ID');
    });
  })
  .catch(err => console.error('Gagal fetch data user di payment:', err));

// Pilih metode pembayaran
document.addEventListener("DOMContentLoaded", function () {
  const paymentButtons = document.querySelectorAll(".payment-method");

  paymentButtons.forEach(btn => {
    btn.addEventListener("click", function () {
      paymentButtons.forEach(b => b.classList.remove("bg-sky-800", "ring", "ring-sky-400"));
      this.classList.add("bg-sky-800", "ring", "ring-sky-400");
      selectedMethod = this.querySelector("span").textContent.trim().toLowerCase();
    });
  });

  // Tambahkan event listener ke tombol bayar
  if (bayarBtn) {
    bayarBtn.addEventListener("click", function () {
      if (!selectedMethod) {
        alert("Silakan pilih metode pembayaran terlebih dahulu.");
        return;
      }

      const paket = document.getElementById('paket').textContent;
      const harga = document.getElementById('harga').textContent;

      // Simpan data ke localStorage untuk dipakai di halaman konfirmasi
      localStorage.setItem('konfirmasiData', JSON.stringify({
        paket: paket,
        harga: harga,
        metode: selectedMethod,
        email: currentUser?.email || "-",
        noHP: currentUser?.noHP || "-",
        totalHarga: currentUser?.totalHarga || 0,
        durasiInt: parseInt(currentUser?.durasiBerlangganan) || 0,
        jenisPembayaran: "perpanjangan"
      }));

      // Arahkan ke halaman konfirmasi sesuai metode
      if (selectedMethod.includes("gopay") || selectedMethod.includes("qris")) {
        window.location.href = "confirmQR.html";
      } else if (selectedMethod.includes("bca virtual account") || selectedMethod.includes("mandiri virtual account")) {
        window.location.href = "confirmVA.html";
      } else if (selectedMethod.includes("ovo")) {
        window.location.href = "confirmPN.html";
      } else {
        alert("Metode pembayaran tidak dikenali.");
      }
    });
  }
});