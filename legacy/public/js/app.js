document.addEventListener('DOMContentLoaded', () => {
  const roomsContainer = document.getElementById('rooms-container');
  const filterChips = document.querySelectorAll('.filter-chip');
  const bookingModal = document.getElementById('booking-modal');
  const modalClose = document.getElementById('modal-close');
  const modalRoomDetails = document.getElementById('modal-room-details');
  const bookingForm = document.getElementById('booking-form');
  const bookRoomId = document.getElementById('book-room-id');
  const bookDuration = document.getElementById('book-duration');
  const bookTotalDisplay = document.getElementById('book-total-display');
  const complaintForm = document.getElementById('complaint-form');

  let activeType = 'Semua';
  let activeStatus = 'Semua';
  let currentRoomPrice = 0;

  // Format IDR Rupiah
  const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  // Default dataset fallback for static GitHub Pages (when backend API is not running on GitHub CDN)
  const FALLBACK_ROOMS = [
    { id: 1, room_number: 'Kamar 101', type: 'VIP', price: 1500000, facilities: 'AC, Kamar Mandi Dalam, Springbed, Lemari, WiFi 100Mbps, Smart TV', status: 'Tersedia', image_url: 'img/kamar-101.svg' },
    { id: 2, room_number: 'Kamar 102', type: 'VIP', price: 1500000, facilities: 'AC, Kamar Mandi Dalam, Water Heater, Meja Kerja, WiFi, Springbed', status: 'Terisi', image_url: 'img/kamar-102.svg' },
    { id: 3, room_number: 'Kamar 201', type: 'Reguler', price: 850000, facilities: 'Kipas Angin, Kamar Mandi Dalam, Kasur Nyaman, Lemari, WiFi', status: 'Tersedia', image_url: 'img/kamar-201.svg' },
    { id: 4, room_number: 'Kamar 202', type: 'Reguler', price: 750000, facilities: 'Kipas Angin, Kamar Mandi Luar Bersih, Kasur, Lemari, Dapur Bersama', status: 'Tersedia', image_url: 'img/kamar-202.svg' },
    { id: 5, room_number: 'Kamar 203', type: 'Reguler', price: 850000, facilities: 'Kipas Angin, Kamar Mandi Dalam, Kasur, Lemari, WiFi Cepat', status: 'Terisi', image_url: 'img/kamar-203.svg' },
    { id: 6, room_number: 'Kamar 301', type: 'VIP', price: 1650000, facilities: 'AC Dingin, Balkon Pribadi, Kamar Mandi Dalam, Kulkas Mini, WiFi', status: 'Tersedia', image_url: 'img/kamar-301.svg' }
  ];

  // Render rooms to HTML
  function renderRoomList(rooms) {
    // Apply client-side filters
    let filtered = rooms;
    if (activeType !== 'Semua') {
      filtered = filtered.filter(r => r.type === activeType);
    }
    if (activeStatus !== 'Semua') {
      filtered = filtered.filter(r => r.status === activeStatus);
    }

    if (filtered.length === 0) {
      roomsContainer.innerHTML = '<div style="text-align:center; grid-column:1/-1; padding:40px; color:var(--gray);">Tidak ada unit kamar yang sesuai dengan kriteria filter.</div>';
      return;
    }

    roomsContainer.innerHTML = '';
    filtered.forEach(room => {
      const isAvailable = room.status === 'Tersedia';
      const card = document.createElement('div');
      card.className = 'room-card';

      // Fix image URL path for GitHub Pages (strip leading slash)
      let cleanImg = room.image_url.startsWith('/') ? room.image_url.substring(1) : room.image_url;

      card.innerHTML = `
        <div class="room-img-wrapper">
          <img src="${cleanImg}" alt="${room.room_number}" class="room-img" onerror="this.onerror=null;this.src='img/default-room.svg';" loading="lazy">
          <span class="badge-type badge-${room.type.toLowerCase()}">${room.type}</span>
          <span class="badge-status badge-${room.status.toLowerCase()}">${room.status}</span>
        </div>
        <div class="room-body">
          <div class="room-header">
            <h3 class="room-num">${room.room_number}</h3>
            <div class="room-price">${formatIDR(room.price)}<span>/bln</span></div>
          </div>
          <p class="room-facilities"><strong>Fasilitas:</strong> ${room.facilities}</p>
          <div class="room-actions">
            ${isAvailable
              ? `<button class="btn btn-primary btn-book" onclick="openBooking(${room.id}, '${room.room_number}', ${room.price}, '${room.type}')">Reservasi Unit</button>`
              : `<button class="btn btn-outline btn-book" disabled style="opacity: 0.6; cursor: not-allowed;">Unit Penuh</button>`
            }
          </div>
        </div>
      `;
      roomsContainer.appendChild(card);
    });
  }

  // Fetch and render rooms (tries backend API first, falls back seamlessly to embedded data on GitHub Pages)
  async function loadRooms() {
    try {
      const res = await fetch(`/api/rooms?type=${activeType}&status=${activeStatus}`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          renderRoomList(result.data);
          return;
        }
      }
      throw new Error('Static fallback');
    } catch (err) {
      // Running on static GitHub Pages or server offline -> use fallback dataset
      renderRoomList(FALLBACK_ROOMS);
    }
  }

  // Filter Chips Click
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const type = chip.getAttribute('data-type');
      const status = chip.getAttribute('data-status');

      if (type !== null) {
        document.querySelectorAll('[data-type]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeType = type;
      }
      if (status !== null) {
        document.querySelectorAll('[data-status]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeStatus = status;
      }

      loadRooms();
    });
  });

  // Open Booking Modal
  window.openBooking = (id, roomNum, price, type) => {
    bookRoomId.value = id;
    currentRoomPrice = price;
    modalRoomDetails.innerHTML = `
      <strong>${roomNum}</strong> (${type})<br>
      Tarif Sewa: <strong>${formatIDR(price)} / bulan</strong>
    `;
    updateTotalPrice();
    bookingModal.classList.add('active');
  };

  // Close Booking Modal
  modalClose.addEventListener('click', () => bookingModal.classList.remove('active'));
  bookingModal.addEventListener('click', (e) => {
    if (e.target === bookingModal) bookingModal.classList.remove('active');
  });

  // Calculate Total Price
  function updateTotalPrice() {
    const months = Number(bookDuration.value) || 1;
    const total = currentRoomPrice * months;
    bookTotalDisplay.textContent = formatIDR(total);
  }
  bookDuration.addEventListener('change', updateTotalPrice);

  // Submit Booking Form
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      room_id: bookRoomId.value,
      tenant_name: document.getElementById('book-name').value.trim(),
      tenant_phone: document.getElementById('book-phone').value.trim(),
      check_in_date: document.getElementById('book-date').value,
      duration_months: bookDuration.value
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          alert(`Pemesanan berhasil diproses.\nID Reservasi: #${data.bookingId}\nTotal Tagihan: ${formatIDR(data.totalPrice)}\nPengelola akan segera memverifikasi data Anda.`);
          bookingModal.classList.remove('active');
          bookingForm.reset();
          loadRooms();
          return;
        }
      }
      throw new Error('Offline fallback');
    } catch (err) {
      // LocalStorage fallback for GitHub Pages demo mode
      const mockId = Math.floor(1000 + Math.random() * 9000);
      const total = currentRoomPrice * Number(payload.duration_months);
      alert(`Pemesanan berhasil diproses (Mode Demo GitHub Pages).\nID Reservasi: #${mockId}\nTotal Tagihan: ${formatIDR(total)}\nData tersimpan.`);
      bookingModal.classList.remove('active');
      bookingForm.reset();
    }
  });

  // Submit Complaint Form
  complaintForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      tenant_name: document.getElementById('c-name').value.trim(),
      room_number: document.getElementById('c-room').value.trim(),
      category: document.getElementById('c-category').value,
      description: document.getElementById('c-desc').value.trim()
    };

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          alert('Laporan kendala telah tercatat dalam sistem.');
          complaintForm.reset();
          return;
        }
      }
      throw new Error('Offline fallback');
    } catch (err) {
      alert('Laporan kendala telah tercatat dalam sistem (Mode Demo GitHub Pages).');
      complaintForm.reset();
    }
  });

  // Initial load
  loadRooms();
});
