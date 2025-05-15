AOS.init({ duration: 1000 });

const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

menuToggle.addEventListener('click', () => {
  if (mobileMenu.classList.contains('hidden')) {
    mobileMenu.classList.remove('hidden');
    mobileMenu.classList.add('animate-slide-down');
  } else {
    mobileMenu.classList.add('hidden');
    mobileMenu.classList.remove('animate-slide-down');
  }
});

document.addEventListener('DOMContentLoaded', async () => {
    const tempId = new URLSearchParams(location.search).get('tempId');
    if (!tempId) return alert('Data tidak ditemukan'), location.href='upgradepaket.html';
  
    // 1) Ambil data sementara
    const resTemp = await fetch(`/api/tempTransaksi/${tempId}`);
    const temp = await resTemp.json();
    if (!resTemp.ok) throw new Error(temp.error);
  
    // Tampilkan:
    document.getElementById('paket').textContent = temp.paket;
    document.getElementById('durasi').textContent = temp.durasi + ' bulan';
    document.getElementById('harga').textContent = `Rp ${temp.total.toLocaleString('id-ID')}`;

    const paymentPrices = document.querySelectorAll('#payment-methods .text-gray-600');
    paymentPrices.forEach(el => {
      el.textContent = temp.total.toLocaleString('id-ID');
    });
    window.__temp = { ...temp, tempId };
  });

  document.addEventListener("DOMContentLoaded", function () {
  const paymentButtons = document.querySelectorAll(".payment-method");

  paymentButtons.forEach(btn => {
    btn.addEventListener("click", function () {
      paymentButtons.forEach(b => b.classList.remove("bg-sky-800", "ring", "ring-sky-400"));
      this.classList.add("bg-sky-800", "ring", "ring-sky-400");
      selectedMethod = this.querySelector("span").textContent.trim().toLowerCase();
    });
  });
  
  // 2) Fungsi bayar
  });

    async function bayarSekarang() {
        if (!selectedMethod) return alert('Pilih metode dulu');

        // Ambil data sementara
        const { tempId, total, paket, durasi, userId: tmpUserId, tanggal: tmpTanggal } = window.__temp;
      
        // Fallback ke localStorage kalau __temp.userId atau __temp.tanggal tidak ada
        const userId  = tmpUserId  || localStorage.getItem('userId');
        const tanggal = tmpTanggal || new Date().toISOString();
      
        const transaksiData = {
          userId,
          tanggal,
          jenis: 'Upgrade',
          paket,
          durasi,
          total,
          metode: selectedMethod
        };
      
        // Debug: pastikan semua field terisi
        console.log('>> akan kirim transaksiData:', transaksiData);
  
    // 2c) Hapus temp entry
    await fetch(`/api/tempTransaksi/${tempId}`, { method:'DELETE' });

    const formattedHarga = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(total);

    var durasiInt;
    durasiInt = durasi;
    jenis = 'upgrade';
    jenisPembayaran = jenis;
    // 2d) Simpan konfirmasiData & redirect
    localStorage.setItem('konfirmasiData', JSON.stringify({ tempId, paket, harga:formattedHarga, durasiInt, jenisPembayaran }));
    window.location.href = 'confirmQR.html';
  }