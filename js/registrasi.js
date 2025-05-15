document.addEventListener('DOMContentLoaded', () => {
  const kecamatanData = {
    Depok: ["Beji", "Cimanggis", "Pancoran Mas"],
    Bogor: ["Bogor Utara", "Bogor Selatan", "Tanah Sareal"],
    Bekasi: ["Bekasi Barat", "Bekasi Timur", "Medansatria"],
  };

  const paketOptions = {
    Reguler: [
      { name: "Basic Plan - 20 Mbps - Rp 150.000/Bulan", harga: 150000 },
      { name: "Standard Plan - 75 Mbps - Rp 300.000/Bulan", harga: 300000 },
      { name: "MaxOne Plan - 100 Mbps - Rp 400.000/Bulan", harga: 400000 },
    ],
    Gamer: [
      { name: "Gamer Basic - 75 Mbps - Rp 350.000/Bulan", harga: 350000 },
      { name: "Gamer Pro - 150 Mbps - Rp 500.000/Bulan", harga: 500000 },
    ],
    Bisnis: [
      { name: "Bisnis Starter - 100 Mbps - Rp 600.000/Bulan", harga: 600000 },
      { name: "Bisnis Pro - 200 Mbps - Rp 1.000.000/Bulan", harga: 1000000 },
    ],
  };

  const hargaPaketEl = document.getElementById('hargaPaket');
  const biayaAdminEl = document.getElementById('biayaAdmin');
  const ppnEl = document.getElementById('ppn');
  const totalEl = document.getElementById('totalHarga');

  const kotaSelect = document.getElementById('kota');
  const kecamatanSelect = document.getElementById('kecamatan');
  const kategoriSelect = document.getElementById('kategoriPaket');
  const paketSelect = document.getElementById('paketInternet');
  const durasiSelect = document.getElementById('durasiBerlangganan');

  kotaSelect.addEventListener('change', () => {
    const kota = kotaSelect.value;
    kecamatanSelect.innerHTML = '';
    kecamatanSelect.disabled = kota === 'default';
    (kecamatanData[kota] || []).forEach(kec => {
      const opt = document.createElement('option');
      opt.value = kec;
      opt.textContent = kec;
      kecamatanSelect.appendChild(opt);
    });
  });

  kategoriSelect.addEventListener('change', () => {
    const kategori = kategoriSelect.value;
    paketSelect.innerHTML = '';
    paketSelect.disabled = kategori === 'default';
    (paketOptions[kategori] || []).forEach(paket => {
      const opt = document.createElement('option');
      opt.value = paket.name;
      opt.textContent = paket.name;
      opt.dataset.harga = paket.harga;
      paketSelect.appendChild(opt);
    });
    updateHarga();
  });

  [paketSelect, durasiSelect].forEach(el => el.addEventListener('change', updateHarga));

  function updateHarga() {
    const hargaPaket = Number(paketSelect.selectedOptions[0]?.dataset.harga || 0);
    const durasi = Number(durasiSelect.value || 1);
    const biayaAdmin = 50000;
    const subTotal = hargaPaket * durasi;
    const ppn = Math.round(subTotal * 0.11);
    const total = subTotal + biayaAdmin + ppn;

    hargaPaketEl.textContent = `Rp ${subTotal.toLocaleString('id-ID')}`;
    biayaAdminEl.textContent = `Rp ${biayaAdmin.toLocaleString('id-ID')}`;
    ppnEl.textContent = `Rp ${ppn.toLocaleString('id-ID')}`;
    totalEl.textContent = `Rp ${total.toLocaleString('id-ID')}`;
  }

  const form = document.getElementById('formPendaftaran');
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const data = {
      nama: document.querySelector("input[placeholder='Masukkan nama Anda']").value.trim(),
      noHP: document.querySelector("input[placeholder='08xxxxxxxxxx']").value.trim(),
      noHPAlternatif: document.querySelectorAll("input[placeholder='08xxxxxxxxxx']")[1].value.trim(),
      noTeleponRumah: document.querySelector("input[placeholder='021xxxxxxx']").value.trim(),
      tempatLahir: document.querySelector("input[placeholder='Masukkan tempat lahir']").value.trim(),
      tanggalLahir: document.querySelector("input[type='date']").value,
      email: document.querySelector("input[type='email']").value.trim(),
      noKTP: document.querySelector("input[placeholder='Masukkan nomor KTP']").value.trim(),
      alamat: document.querySelector("textarea").value.trim(),
      kota: kotaSelect.value,
      kecamatan: kecamatanSelect.value,
      kategoriPaket: kategoriSelect.value,
      paketInternet: paketSelect.value,
      durasiBerlangganan: Number(durasiSelect.value),
      hargaPaket: hargaPaketEl.textContent,
      biayaAdmin: biayaAdminEl.textContent,
      ppn: ppnEl.textContent,
      totalHarga: totalEl.textContent
    };

    try {
      const res = await fetch('/api/pelanggan/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Unknown error');
      alert(`Registrasi sukses!\nID: ${result.id}`);
      window.location.href = `dashboard.html?userId=${result.id}`;
    } catch (err) {
      console.error(err);
      alert('Gagal mendaftar: ' + err.message);
    }
  });
});