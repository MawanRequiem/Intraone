const userId = localStorage.getItem('userId');
    if (!userId) {
      alert("Belum login!");
      window.location.href = "login.html";
    }

    fetch(`/api/pelanggan/${userId}`)
      .then(res => res.json())
      .then(data => {
        document.getElementById('profilNama').textContent = data.nama;
        document.getElementById('profilEmail').textContent = data.email;
        document.getElementById('profilHP').textContent = data.noHP;
        document.getElementById('profilTTL').textContent = `${data.tempatLahir}, ${new Date(data.tanggalLahir).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`;
        document.getElementById('profilKTP').textContent = data.noKTP;
        document.getElementById('profilAlamat').textContent = data.alamat;
        document.getElementById('profilWilayah').textContent = data.kota;
        document.getElementById('profilPaket').textContent = data.paketInternet;
      })
      .catch(err => {
        console.error('Gagal memuat profil:', err);
        alert('Gagal memuat data profil.');
      });