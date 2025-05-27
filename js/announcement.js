const form = document.getElementById('announcementForm');
const listDiv = document.getElementById('announcementList');
const searchInput = document.getElementById('searchInput');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;

  const res = await fetch('/api/announcements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content })
  });

  const result = await res.json();
  if (result.success) {
    form.reset();
    loadAnnouncements();
  } else {
    alert('Gagal membuat pengumuman');
  }
});

searchInput.addEventListener('input', () => {
  loadAnnouncements(searchInput.value.toLowerCase());
});

async function loadAnnouncements(filter = '') {
  const res = await fetch('/api/announcements');
  const { data } = await res.json();
  listDiv.innerHTML = '';

  data
    .filter(item => item.title.toLowerCase().includes(filter))
    .forEach(({ id, title, content, date, statusAnnouncement }) => {
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
      <h4 class="text-2xl font-bold">${title}</h4>
      <p class="text-slate-200">${content}</p>
      <small class="text-sm text-slate-400">Dibuat pada ${tanggalFormatted} pukul ${jamFormatted} WIB</small>
      <div>Status: ${statusBadge}</div>
      <div class="flex justify-between mt-2">
        <button onclick="toggleStatus('${id}', '${statusAnnouncement}')" class="btn btn-sm btn-warning">Ubah Status</button>
        <button onclick="deleteAnnouncement('${id}')" class="btn btn-sm btn-danger">Hapus</button>
      </div>
    </div>
  `;

  listDiv.appendChild(card);
});

}

async function toggleStatus(id, currentStatus) {
  const newStatus = currentStatus === 'aktif' ? 'nonaktif' : 'aktif';

  const res = await fetch(`/api/announcements/${id}/statusAnnouncement`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ statusAnnouncement: newStatus })
  });

  const result = await res.json();
  if (result.success) {
    loadAnnouncements();
  } else {
    alert(result.message || 'Gagal mengubah status');
  }
}


async function deleteAnnouncement(id) {
  const confirmed = confirm('Yakin ingin menghapus pengumuman ini?');
  if (!confirmed) return;

  const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
  const result = await res.json();
  if (result.success) {
    loadAnnouncements();
  } else {
    alert('Gagal menghapus pengumuman');
  }
}

loadAnnouncements();
