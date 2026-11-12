const API_BASE = '/api';

// Format Indonesian Rupiah currency
export const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(number || 0);
};

// Rooms API
export const fetchRooms = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/rooms?${query}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal memuat daftar kamar');
  return data.data;
};

export const createRoom = async (formData) => {
  const isMultipart = formData instanceof FormData;
  const res = await fetch(`${API_BASE}/rooms`, {
    method: 'POST',
    headers: isMultipart ? {} : { 'Content-Type': 'application/json' },
    body: isMultipart ? formData : JSON.stringify(formData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal menambahkan kamar');
  return data;
};

export const updateRoom = async (id, formData) => {
  const isMultipart = formData instanceof FormData;
  const res = await fetch(`${API_BASE}/rooms/${id}`, {
    method: 'PUT',
    headers: isMultipart ? {} : { 'Content-Type': 'application/json' },
    body: isMultipart ? formData : JSON.stringify(formData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal memperbarui kamar');
  return data;
};

export const updateRoomStatus = async (id, status) => {
  const res = await fetch(`${API_BASE}/rooms/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal mengubah status kamar');
  return data;
};

export const deleteRoom = async (id) => {
  const res = await fetch(`${API_BASE}/rooms/${id}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal menghapus kamar');
  return data;
};

// Bookings API
export const fetchBookings = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/bookings?${query}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal memuat data reservasi');
  return data.data;
};

export const createBooking = async (formData) => {
  const isMultipart = formData instanceof FormData;
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: isMultipart ? {} : { 'Content-Type': 'application/json' },
    body: isMultipart ? formData : JSON.stringify(formData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal memproses reservasi');
  return data;
};

export const updateBookingPayment = async (id, payment_status) => {
  const res = await fetch(`${API_BASE}/bookings/${id}/payment`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payment_status })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal mengubah status pembayaran');
  return data;
};

export const deleteBooking = async (id) => {
  const res = await fetch(`${API_BASE}/bookings/${id}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal menghapus reservasi');
  return data;
};

// Complaints API
export const fetchComplaints = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/complaints?${query}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal memuat pengaduan');
  return data.data;
};

export const createComplaint = async (formData) => {
  const isMultipart = formData instanceof FormData;
  const res = await fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    headers: isMultipart ? {} : { 'Content-Type': 'application/json' },
    body: isMultipart ? formData : JSON.stringify(formData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal mengirim laporan kendala');
  return data;
};

export const updateComplaintStatus = async (id, status) => {
  const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal mengubah status pengaduan');
  return data;
};

export const deleteComplaint = async (id) => {
  const res = await fetch(`${API_BASE}/complaints/${id}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal menghapus pengaduan');
  return data;
};

// Dashboard Stats API
export const fetchDashboardStats = async () => {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal memuat statistik dashboard');
  return data.data;
};

// Upload & Gallery API
export const uploadImage = async (file, type = 'general') => {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${API_BASE}/upload?type=${type}`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal mengunggah gambar');
  return data.data;
};

export const fetchUploadedGallery = async (category = 'all') => {
  const res = await fetch(`${API_BASE}/upload/gallery?category=${category}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal memuat galeri gambar');
  return data.data;
};
