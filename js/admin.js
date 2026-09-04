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

  // Fallback data for static GitHub Pages
  let localRooms = [
    { id: 1, room_number: 'Kamar 101', type: 'VIP', price: 1500000, facilities: 'AC, Kamar Mandi Dalam, Springbed, Lemari, WiFi 100Mbps, Smart TV', status: 'Tersedia' },
    { id: 2, room_number: 'Kamar 102', type: 'VIP', price: 1500000, facilities: 'AC, Kamar Mandi Dalam, Water Heater, Meja Kerja, WiFi, Springbed', status: 'Terisi' },
    { id: 3, room_number: 'Kamar 201', type: 'Reguler', price: 850000, facilities: 'Kipas Angin, Kamar Mandi Dalam, Kasur Nyaman, Lemari, WiFi', status: 'Tersedia' },
    { id: 4, room_number: 'Kamar 202', type: 'Reguler', price: 750000, facilities: 'Kipas Angin, Kamar Mandi Luar Bersih, Kasur, Lemari, Dapur Bersama', status: 'Tersedia' },
    { id: 5, room_number: 'Kamar 203', type: 'Reguler', price: 850000, facilities: 'Kipas Angin, Kamar Mandi Dalam, Kasur, Lemari, WiFi Cepat', status: 'Terisi' },
    { id: 6, room_number: 'Kamar 301', type: 'VIP', price: 1650000, facilities: 'AC Dingin, Balkon Pribadi, Kamar Mandi Dalam, Kulkas Mini, WiFi', status: 'Tersedia' }
  ];

  let localBookings = [
    { id: 1, tenant_name: 'Dimas Pratama', tenant_phone: '081234567890', room_number: 'Kamar 102', room_type: 'VIP', check_in_date: '2026-09-01', duration_months: 3, total_price: 4500000, payment_status: 'Lunas' },
    { id: 2, tenant_name: 'Ahmad Fauzi', tenant_phone: '082198765432', room_number: 'Kamar 203', room_type: 'Reguler', check_in_date: '2026-09-02', duration_months: 1, total_price: 850000, payment_status: 'Lunas' }
  ];

  let localComplaints = [
    { id: 1, tenant_name: 'Dimas Pratama', room_number: 'Kamar 102', category: 'Listrik', description: 'Lampu kamar mandi redup perlu diganti bohlam baru.', created_at: new Date().toISOString(), status: 'Pending' }
  ];

  // Load Dashboard Summary Stats
  async function loadStats() {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          const s = result.data;
          statTotalRooms.textContent = s.totalRooms;
          statOccupiedRooms.textContent = s.occupiedRooms;
          statAvailableRooms.textContent = s.availableRooms;
          statRevenue.textContent = formatIDR(s.totalRevenue);
          statComplaints.textContent = s.activeComplaints;
          return;
        }
      }
      throw new Error('Static fallback');
    } catch (e) {
      // Calculate from local data on GitHub Pages
      const total = localRooms.length;
      const occupied = localRooms.filter(r => r.status === 'Terisi').length;
      const available = total - occupied;
      const revenue = localBookings.filter(b => b.payment_status === 'Lunas').reduce((acc, b) => acc + b.total_price, 0);
      const complaints = localComplaints.filter(c => c.status !== 'Selesai').length;

      statTotalRooms.textContent = total;
      statOccupiedRooms.textContent = occupied;
      statAvailableRooms.textContent = available;
      statRevenue.textContent = formatIDR(revenue);
      statComplaints.textContent = complaints;
    }
  }

  // Render Rooms Table
  function renderRoomsTable(rooms) {
    roomsTableBody.innerHTML = '';
    rooms.forEach(r => {
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

  // Load Rooms Table
  async function loadRooms() {
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          renderRoomsTable(result.data);
          return;
        }
      }
      throw new Error('Static fallback');
    } catch (e) {
      renderRoomsTable(localRooms);
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
      if (res.ok) {
        loadRooms();
        loadStats();
        return;
      }
      throw new Error('Offline fallback');
    } catch (e) {
      const room = localRooms.find(r => r.id === id);
      if (room) room.status = newStatus;
      renderRoomsTable(localRooms);
      loadStats();
    }
  };

  // Delete Room
  window.deleteRoom = async (id) => {
    if (!confirm('Hapus unit kamar ini dari sistem?')) return;
    try {
      const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadRooms();
        loadStats();
        return;
      }
      throw new Error('Offline fallback');
    } catch (e) {
      localRooms = localRooms.filter(r => r.id !== id);
      renderRoomsTable(localRooms);
      loadStats();
    }
  };

  // Render Bookings Table
  function renderBookingsTable(bookings) {
    bookingsTableBody.innerHTML = '';
    bookings.forEach(b => {
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

  // Load Bookings Table
  async function loadBookings() {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          renderBookingsTable(result.data);
          return;
        }
      }
      throw new Error('Static fallback');
    } catch (e) {
      renderBookingsTable(localBookings);
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
      if (res.ok) {
        loadBookings();
        loadStats();
        return;
      }
      throw new Error('Offline fallback');
    } catch (e) {
      const booking = localBookings.find(b => b.id === id);
      if (booking) booking.payment_status = newStatus;
      renderBookingsTable(localBookings);
      loadStats();
    }
  };

  // Render Complaints Table
  function renderComplaintsTable(complaints) {
    complaintsTableBody.innerHTML = '';
    complaints.forEach(c => {
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

  // Load Complaints Table
  async function loadComplaints() {
    try {
      const res = await fetch('/api/complaints');
      if (res.ok) {
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          renderComplaintsTable(result.data);
          return;
        }
      }
      throw new Error('Static fallback');
    } catch (e) {
      renderComplaintsTable(localComplaints);
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
      if (res.ok) {
        loadStats();
        return;
      }
      throw new Error('Offline fallback');
    } catch (e) {
      const complaint = localComplaints.find(c => c.id === id);
      if (complaint) complaint.status = status;
      loadStats();
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
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          alert('Unit kamar berhasil ditambahkan ke sistem.');
          addRoomModal.classList.remove('active');
          addRoomForm.reset();
          loadRooms();
          loadStats();
          return;
        }
      }
      throw new Error('Offline fallback');
    } catch (e) {
      localRooms.push({
        id: localRooms.length + 1,
        room_number: payload.room_number,
        type: payload.type,
        price: Number(payload.price),
        facilities: payload.facilities,
        status: 'Tersedia'
      });
      alert('Unit kamar berhasil ditambahkan (Mode Demo GitHub Pages).');
      addRoomModal.classList.remove('active');
      addRoomForm.reset();
      renderRoomsTable(localRooms);
      loadStats();
    }
  });

  // Initial Load
  loadStats();
  loadRooms();
  loadBookings();
  loadComplaints();
});
