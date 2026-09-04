document.addEventListener('DOMContentLoaded', () => {
  const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  // DOM Elements
  const statTotalRooms = document.getElementById('stat-total-rooms');
  const statOccupiedRooms = document.getElementById('stat-occupied-rooms');
  const statAvailableRooms = document.getElementById('stat-available-rooms');
  const statRevenue = document.getElementById('stat-revenue');
  const statComplaints = document.getElementById('stat-complaints');

  const roomsTableBody = document.getElementById('rooms-table-body');
  const bookingsTableBody = document.getElementById('bookings-table-body');
  const complaintsTableBody = document.getElementById('complaints-table-body');

  const addRoomModal = document.getElementById('add-room-modal');
  const btnAddRoom = document.getElementById('btn-add-room');
  const modalRoomClose = document.getElementById('modal-room-close');
  const addRoomForm = document.getElementById('add-room-form');

  // Load Dashboard Summary Stats
  async function loadStats() {
    try {
      const res = await fetch('/api/dashboard/stats');
      const result = await res.json();
      if (result.success) {
        const s = result.data;
        statTotalRooms.textContent = s.totalRooms;
        statOccupiedRooms.textContent = s.occupiedRooms;
        statAvailableRooms.textContent = s.availableRooms;
        statRevenue.textContent = formatIDR(s.totalRevenue);
        statComplaints.textContent = s.activeComplaints;
      }
    } catch (e) {
      console.error('Failed to load stats:', e);
    }
  }

  // Load Rooms Table
  async function loadRooms() {
    try {
      const res = await fetch('/api/rooms');
      const result = await res.json();
      if (result.success) {
        roomsTableBody.innerHTML = '';
        if (result.data.length === 0) {
          roomsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Belum ada data unit kamar.</td></tr>';
          return;
        }

        result.data.forEach(r => {
          const isTersedia = r.status === 'Tersedia';
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><strong>${r.room_number}</strong></td>
            <td><span class="badge-type badge-${r.type.toLowerCase()}" style="position:static;">${r.type}</span></td>
            <td><strong>${formatIDR(r.price)}</strong></td>
            <td style="max-width: 250px; font-size: 0.85rem; color: var(--gray);">${r.facilities}</td>
            <td>
              <span class="badge-status badge-${r.status.toLowerCase()}" style="position:static;">${r.status}</span>
            </td>
            <td>
              <div style="display: flex; gap: 6px;">
                <button class="btn btn-outline" style="padding: 4px 10px; font-size: 0.8rem;" onclick="toggleRoomStatus(${r.id}, '${isTersedia ? 'Terisi' : 'Tersedia'}')">
                  Ubah ke ${isTersedia ? 'Terisi' : 'Tersedia'}
                </button>
                <button class="btn btn-danger" style="padding: 4px 10px; font-size: 0.8rem;" onclick="deleteRoom(${r.id})">
                  Hapus
                </button>
              </div>
            </td>
          `;
          roomsTableBody.appendChild(tr);
        });
      }
    } catch (e) {
      roomsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Gagal memuat data kamar.</td></tr>';
    }
  }

  // Toggle Room Status
  window.toggleRoomStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/rooms/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        loadRooms();
        loadStats();
      }
    } catch (e) {
      alert('Gagal mengubah status kamar.');
    }
  };

  // Delete Room
  window.deleteRoom = async (id) => {
    if (!confirm('Hapus unit kamar ini dari sistem?')) return;
    try {
      const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadRooms();
        loadStats();
      }
    } catch (e) {
      alert('Gagal menghapus unit kamar.');
    }
  };

  // Load Bookings Table
  async function loadBookings() {
    try {
      const res = await fetch('/api/bookings');
      const result = await res.json();
      if (result.success) {
        bookingsTableBody.innerHTML = '';
        if (result.data.length === 0) {
          bookingsTableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Belum ada riwayat pemesanan masuk.</td></tr>';
          return;
        }

        result.data.forEach(b => {
          const isLunas = b.payment_status === 'Lunas';
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>#${b.id}</td>
            <td><strong>${b.tenant_name}</strong></td>
            <td><a href="https://wa.me/${b.tenant_phone.replace(/^0/, '62')}" target="_blank" style="color: var(--primary); text-decoration: none;">${b.tenant_phone}</a></td>
            <td>${b.room_number} (${b.room_type})</td>
            <td>${b.check_in_date}</td>
            <td>${b.duration_months} Bulan</td>
            <td><strong>${formatIDR(b.total_price)}</strong></td>
            <td>
              <button class="btn ${isLunas ? 'btn-success' : 'btn-outline'}" style="padding: 4px 10px; font-size: 0.8rem;" onclick="togglePayment(${b.id}, '${isLunas ? 'Menunggu Pembayaran' : 'Lunas'}')">
                ${isLunas ? 'Lunas' : 'Belum Lunas'}
              </button>
            </td>
          `;
          bookingsTableBody.appendChild(tr);
        });
      }
    } catch (e) {
      bookingsTableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: red;">Gagal memuat data pemesanan.</td></tr>';
    }
  }

  // Toggle Payment Status
  window.togglePayment = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/bookings/${id}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        loadBookings();
        loadStats();
      }
    } catch (e) {
      alert('Gagal mengubah status pembayaran.');
    }
  };

  // Load Complaints Table
  async function loadComplaints() {
    try {
      const res = await fetch('/api/complaints');
      const result = await res.json();
      if (result.success) {
        complaintsTableBody.innerHTML = '';
        if (result.data.length === 0) {
          complaintsTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Tidak ada laporan kendala aktif saat ini.</td></tr>';
          return;
        }

        result.data.forEach(c => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>#${c.id}</td>
            <td><strong>${c.tenant_name}</strong></td>
            <td>${c.room_number}</td>
            <td><span style="background: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">${c.category}</span></td>
            <td style="max-width: 280px; font-size: 0.85rem;">${c.description}</td>
            <td style="font-size: 0.8rem; color: var(--gray);">${new Date(c.created_at).toLocaleDateString('id-ID')}</td>
            <td>
              <select class="form-control" style="padding: 4px 8px; font-size: 0.85rem; width: auto;" onchange="updateComplaintStatus(${c.id}, this.value)">
                <option value="Pending" ${c.status === 'Pending' ? 'selected' : ''}>Pending</option>
                <option value="Diproses" ${c.status === 'Diproses' ? 'selected' : ''}>Diproses</option>
                <option value="Selesai" ${c.status === 'Selesai' ? 'selected' : ''}>Selesai</option>
              </select>
            </td>
          `;
          complaintsTableBody.appendChild(tr);
        });
      }
    } catch (e) {
      complaintsTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Gagal memuat laporan kendala.</td></tr>';
    }
  }

  // Update Complaint Status
  window.updateComplaintStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/complaints/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        loadStats();
      }
    } catch (e) {
      alert('Gagal memperbarui status kendala.');
    }
  };

  // Add Room Modal Handlers
  btnAddRoom.addEventListener('click', () => addRoomModal.classList.add('active'));
  modalRoomClose.addEventListener('click', () => addRoomModal.classList.remove('active'));
  addRoomModal.addEventListener('click', (e) => {
    if (e.target === addRoomModal) addRoomModal.classList.remove('active');
  });

  addRoomForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      room_number: document.getElementById('new-room-num').value.trim(),
      type: document.getElementById('new-room-type').value,
      price: document.getElementById('new-room-price').value,
      facilities: document.getElementById('new-room-fac').value.trim(),
      image_url: document.getElementById('new-room-img').value.trim()
    };

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert('Unit kamar berhasil ditambahkan ke sistem.');
        addRoomModal.classList.remove('active');
        addRoomForm.reset();
        loadRooms();
        loadStats();
      } else {
        alert('Gagal: ' + data.error);
      }
    } catch (e) {
      alert('Terjadi kendala saat menambahkan unit kamar.');
    }
  });

  // Initial Load
  loadStats();
  loadRooms();
  loadBookings();
  loadComplaints();
});
