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

  // Fetch and render rooms
  async function loadRooms() {
    try {
      roomsContainer.innerHTML = '<div style="text-align:center; grid-column:1/-1; padding:40px;">Memuat data kamar...</div>';
      const res = await fetch(`/api/rooms?type=${activeType}&status=${activeStatus}`);
      const result = await res.json();

      if (!result.success || result.data.length === 0) {
        roomsContainer.innerHTML = '<div style="text-align:center; grid-column:1/-1; padding:40px; color:var(--gray);">Tidak ada kamar yang sesuai dengan filter yang dipilih.</div>';
        return;
      }

      roomsContainer.innerHTML = '';
      result.data.forEach(room => {
        const isAvailable = room.status === 'Tersedia';
        const card = document.createElement('div');
        card.className = 'room-card';

        card.innerHTML = `
          <div class="room-img-wrapper">
            <img src="${room.image_url}" alt="${room.room_number}" class="room-img" onerror="this.onerror=null;this.src='/img/default-room.svg';" loading="lazy">
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
    } catch (err) {
      roomsContainer.innerHTML = '<div style="text-align:center; grid-column:1/-1; padding:40px; color:red;">Gagal mengambil data kamar dari server.</div>';
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
      const data = await res.json();

      if (data.success) {
        alert(`Pemesanan berhasil dikirim.\nID Reservasi: #${data.bookingId}\nTotal Tagihan: ${formatIDR(data.totalPrice)}\nPengelola akan segera memverifikasi data Anda.`);
        bookingModal.classList.remove('active');
        bookingForm.reset();
        loadRooms();
      } else {
        alert('Gagal: ' + data.error);
      }
    } catch (err) {
      alert('Terjadi kendala jaringan saat memproses reservasi.');
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
      const data = await res.json();

      if (data.success) {
        alert('Laporan kendala telah tercatat dalam sistem dan akan segera ditindaklanjuti.');
        complaintForm.reset();
      } else {
        alert('Gagal: ' + data.error);
      }
    } catch (err) {
      alert('Terjadi kendala jaringan saat mengirim laporan.');
    }
  });

  // Initial load
  loadRooms();
});
