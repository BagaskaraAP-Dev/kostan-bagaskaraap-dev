import React, { useState, useEffect } from 'react';
import {
  fetchDashboardStats,
  fetchRooms,
  createRoom,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
  fetchBookings,
  updateBookingPayment,
  deleteBooking,
  fetchComplaints,
  updateComplaintStatus,
  deleteComplaint,
  fetchUploadedGallery,
  uploadImage,
  formatRupiah
} from '../services/api';
import {
  Building2,
  DollarSign,
  AlertTriangle,
  Users,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Check,
  ExternalLink
} from 'lucide-react';

export default function AdminDashboard({ onPreviewImage, notify }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'rooms' | 'bookings' | 'complaints' | 'gallery'
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Room modal state
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomFormData, setRoomFormData] = useState({
    room_number: '',
    type: 'Reguler',
    price: '',
    facilities: '',
    status: 'Tersedia',
    image_url: ''
  });
  const [roomImageFile, setRoomImageFile] = useState(null);
  const [roomImagePreview, setRoomImagePreview] = useState(null);

  // Gallery upload state
  const [uploadCategory, setUploadCategory] = useState('rooms');
  const [isUploading, setIsUploading] = useState(false);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsData, roomsData, bookingsData, complaintsData, galleryData] = await Promise.all([
        fetchDashboardStats(),
        fetchRooms(),
        fetchBookings(),
        fetchComplaints(),
        fetchUploadedGallery('all')
      ]);
      setStats(statsData);
      setRooms(roomsData);
      setBookings(bookingsData);
      setComplaints(complaintsData);
      setGalleryImages(galleryData);
    } catch (err) {
      notify(err.message || 'Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Room CRUD Handlers
  const openAddRoomModal = () => {
    setEditingRoom(null);
    setRoomFormData({
      room_number: '',
      type: 'Reguler',
      price: '',
      facilities: 'Kipas Angin, Kamar Mandi Luar, Kasur, Lemari, WiFi',
      status: 'Tersedia',
      image_url: '/img/default-room.svg'
    });
    setRoomImageFile(null);
    setRoomImagePreview(null);
    setIsRoomModalOpen(true);
  };

  const openEditRoomModal = (room) => {
    setEditingRoom(room);
    setRoomFormData({
      room_number: room.room_number,
      type: room.type,
      price: room.price,
      facilities: room.facilities,
      status: room.status,
      image_url: room.image_url
    });
    setRoomImageFile(null);
    setRoomImagePreview(room.image_url);
    setIsRoomModalOpen(true);
  };

  const handleRoomImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRoomImageFile(file);
      setRoomImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('room_number', roomFormData.room_number);
      data.append('type', roomFormData.type);
      data.append('price', roomFormData.price);
      data.append('facilities', roomFormData.facilities);
      data.append('status', roomFormData.status);
      data.append('image_url', roomFormData.image_url);

      if (roomImageFile) {
        data.append('image', roomImageFile);
      }

      if (editingRoom) {
        await updateRoom(editingRoom.id, data);
        notify(`Kamar ${roomFormData.room_number} berhasil diperbarui!`, 'success');
      } else {
        await createRoom(data);
        notify(`Kamar baru ${roomFormData.room_number} berhasil dibuat!`, 'success');
      }

      setIsRoomModalOpen(false);
      loadAllData();
    } catch (err) {
      notify(err.message || 'Gagal menyimpan kamar', 'error');
    }
  };

  const handleDeleteRoom = async (room) => {
    if (confirm(`Yakin ingin menghapus ${room.room_number}?`)) {
      try {
        await deleteRoom(room.id);
        notify(`Kamar ${room.room_number} dihapus`, 'success');
        loadAllData();
      } catch (err) {
        notify(err.message, 'error');
      }
    }
  };

  const handleQuickStatusChange = async (roomId, newStatus) => {
    try {
      await updateRoomStatus(roomId, newStatus);
      notify(`Status kamar berhasil diubah ke ${newStatus}`, 'success');
      loadAllData();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  // Booking Handlers
  const handlePaymentStatusChange = async (bookingId, newStatus) => {
    try {
      await updateBookingPayment(bookingId, newStatus);
      notify(`Status pembayaran diubah ke ${newStatus}`, 'success');
      loadAllData();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (confirm('Yakin ingin menghapus data reservasi ini?')) {
      try {
        await deleteBooking(bookingId);
        notify('Data reservasi berhasil dihapus', 'success');
        loadAllData();
      } catch (err) {
        notify(err.message, 'error');
      }
    }
  };

  // Complaint Handlers
  const handleComplaintStatusChange = async (complaintId, newStatus) => {
    try {
      await updateComplaintStatus(complaintId, newStatus);
      notify(`Status pengaduan diubah ke ${newStatus}`, 'success');
      loadAllData();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const handleDeleteComplaint = async (complaintId) => {
    if (confirm('Yakin ingin menghapus laporan pengaduan ini?')) {
      try {
        await deleteComplaint(complaintId);
        notify('Laporan pengaduan dihapus', 'success');
        loadAllData();
      } catch (err) {
        notify(err.message, 'error');
      }
    }
  };

  // Gallery Direct Upload Handler
  const handleGalleryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadImage(file, uploadCategory);
      notify(`Gambar ${file.name} berhasil diunggah ke kategori ${uploadCategory}!`, 'success');
      loadAllData();
    } catch (err) {
      notify(err.message || 'Gagal mengunggah gambar', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-indigo-600" />
            <span>Panel Pengelola Kostan</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manajemen unit kamar, verifikasi sewa & bukti transfer, laporan fasilitas, dan media foto
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={openAddRoomModal}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-200 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kamar</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-slate-200 no-scrollbar">
        {[
          { id: 'overview', label: 'Ringkasan Statistik', icon: Building2 },
          { id: 'rooms', label: `Daftar Kamar (${rooms.length})`, icon: Building2 },
          { id: 'bookings', label: `Reservasi (${bookings.length})`, icon: Users },
          { id: 'complaints', label: `Laporan Kendala (${complaints.length})`, icon: AlertTriangle },
          { id: 'gallery', label: `Galeri Media Foto (${galleryImages.length})`, icon: ImageIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW STATS */}
      {activeTab === 'overview' && stats && (
        <div className="py-6 space-y-8">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Unit</span>
                <Building2 className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="text-3xl font-black text-slate-900">{stats.totalRooms}</div>
              <div className="mt-2 text-xs font-semibold text-slate-500">
                <span className="text-emerald-600 font-bold">{stats.availableRooms} Tersedia</span> /{' '}
                <span className="text-rose-600 font-bold">{stats.occupiedRooms} Terisi</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Occupancy Rate</span>
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-emerald-600">{stats.occupancyRate}%</div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.occupancyRate}%` }}
                ></div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Omset Lunas</span>
                <DollarSign className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-600 truncate">
                {formatRupiah(stats.totalRevenue)}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Tertunda: <span className="font-semibold text-amber-600">{formatRupiah(stats.pendingRevenue)}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Kendala Aktif</span>
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-3xl font-black text-amber-600">{stats.activeComplaints}</div>
              <div className="mt-2 text-xs text-slate-500">
                Pending penanganan: <span className="font-bold text-rose-600">{stats.pendingComplaints}</span>
              </div>
            </div>
          </div>

          {/* Recent Bookings and Complaints side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-base">Reservasi Terbaru</h3>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Lihat Semua &rarr;
                </button>
              </div>

              {stats.recentBookings?.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">Belum ada data reservasi masuk</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentBookings?.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-900">{b.tenant_name}</div>
                        <div className="text-xs text-slate-500">
                          {b.room_number} • {b.duration_months} Bulan • {formatRupiah(b.total_price)}
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          b.payment_status === 'Lunas'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.payment_status === 'Menunggu Pembayaran'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {b.payment_status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Complaints */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-base">Pengaduan Masuk Terbaru</h3>
                <button
                  onClick={() => setActiveTab('complaints')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Lihat Semua &rarr;
                </button>
              </div>

              {stats.recentComplaints?.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">Tidak ada laporan gangguan aktif</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentComplaints?.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-900">
                          {c.room_number} ({c.tenant_name})
                        </div>
                        <div className="text-xs text-slate-500 line-clamp-1">{c.description}</div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          c.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'Diproses'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROOMS MANAGEMENT */}
      {activeTab === 'rooms' && (
        <div className="py-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                  <tr>
                    <th className="px-6 py-3.5">Unit Kamar</th>
                    <th className="px-6 py-3.5">Tipe</th>
                    <th className="px-6 py-3.5">Tarif / Bulan</th>
                    <th className="px-6 py-3.5">Fasilitas</th>
                    <th className="px-6 py-3.5">Status Ketersediaan</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={room.image_url || '/img/default-room.svg'}
                            alt={room.room_number}
                            className="w-12 h-10 object-cover rounded-lg border border-slate-200 cursor-pointer shadow-2xs hover:scale-105 transition-transform"
                            onClick={() => onPreviewImage(room.image_url, room.room_number)}
                          />
                          <span className="font-bold text-slate-900">{room.room_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                            room.type === 'VIP' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {room.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-indigo-600">{formatRupiah(room.price)}</td>
                      <td className="px-6 py-4 max-w-xs truncate text-xs text-slate-500">{room.facilities}</td>
                      <td className="px-6 py-4">
                        <select
                          value={room.status}
                          onChange={(e) => handleQuickStatusChange(room.id, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none transition ${
                            room.status === 'Tersedia'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : room.status === 'Terisi'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="Tersedia">Tersedia</option>
                          <option value="Terisi">Terisi</option>
                          <option value="Renovasi">Renovasi</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditRoomModal(room)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit Data Kamar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Unit Kamar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BOOKINGS MANAGEMENT WITH PAYMENT PROOFS */}
      {activeTab === 'bookings' && (
        <div className="py-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                  <tr>
                    <th className="px-6 py-3.5">Penyewa & Kontak</th>
                    <th className="px-6 py-3.5">Unit Kamar</th>
                    <th className="px-6 py-3.5">Mulai Check-in</th>
                    <th className="px-6 py-3.5">Durasi & Biaya</th>
                    <th className="px-6 py-3.5">Bukti Transfer (Foto)</th>
                    <th className="px-6 py-3.5">Status Pembayaran</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                        Belum ada data reservasi masuk
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{b.tenant_name}</div>
                          <a
                            href={`https://wa.me/${b.tenant_phone?.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-indigo-600 hover:underline"
                          >
                            {b.tenant_phone}
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 block">{b.room_number}</span>
                          <span className="text-xs text-slate-500">{b.room_type}</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">{b.check_in_date}</td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 block">{formatRupiah(b.total_price)}</span>
                          <span className="text-xs text-slate-500">{b.duration_months} Bulan</span>
                        </td>
                        <td className="px-6 py-4">
                          {b.payment_proof ? (
                            <button
                              onClick={() => onPreviewImage(b.payment_proof, `Bukti Bayar - ${b.tenant_name}`)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>Lihat Struk</span>
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Tanpa Bukti</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={b.payment_status}
                            onChange={(e) => handlePaymentStatusChange(b.id, e.target.value)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none transition ${
                              b.payment_status === 'Lunas'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : b.payment_status === 'Menunggu Pembayaran'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                          >
                            <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
                            <option value="Lunas">Lunas</option>
                            <option value="Ditolak">Ditolak</option>
                            <option value="Dibatalkan">Dibatalkan</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteBooking(b.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Reservasi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMPLAINTS MANAGEMENT WITH DAMAGE PHOTOS */}
      {activeTab === 'complaints' && (
        <div className="py-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                  <tr>
                    <th className="px-6 py-3.5">Pelapor & Kamar</th>
                    <th className="px-6 py-3.5">Kategori</th>
                    <th className="px-6 py-3.5">Deskripsi Masalah</th>
                    <th className="px-6 py-3.5">Foto Bukti Kerusakan</th>
                    <th className="px-6 py-3.5">Status Penanganan</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                        Tidak ada laporan kendala fasilitas saat ini
                      </td>
                    </tr>
                  ) : (
                    complaints.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{c.room_number}</div>
                          <div className="text-xs text-slate-500">{c.tenant_name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                            {c.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-sm text-xs text-slate-700 leading-relaxed">
                          {c.description}
                        </td>
                        <td className="px-6 py-4">
                          {c.photo_url ? (
                            <button
                              onClick={() => onPreviewImage(c.photo_url, `Bukti Kerusakan - ${c.room_number}`)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>Lihat Foto Kerusakan</span>
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Tanpa Foto</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={c.status}
                            onChange={(e) => handleComplaintStatusChange(c.id, e.target.value)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none transition ${
                              c.status === 'Selesai'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : c.status === 'Diproses'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                                : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Diproses">Diproses</option>
                            <option value="Selesai">Selesai</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteComplaint(c.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Laporan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MEDIA GALLERY (EXTENSION FITUR GAMBAR) */}
      {activeTab === 'gallery' && (
        <div className="py-6 space-y-6">
          {/* Upload banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-50 via-white to-indigo-50 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-600" />
                <span>Media Manager & Extension Upload Gambar</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Unggah dan kelola foto kamar, bukti struk reservasi, atau dokumentasi kendala penghuni.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
              >
                <option value="rooms">Kategori Kamar</option>
                <option value="complaints">Kategori Kendala</option>
                <option value="bookings">Kategori Reservasi</option>
                <option value="general">Umum / General</option>
              </select>

              <label className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition flex items-center gap-2 shadow-sm">
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Mengunggah...' : 'Upload File'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {galleryImages.map((img, idx) => (
              <div
                key={idx}
                className="group relative bg-white rounded-xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-md transition flex flex-col"
              >
                <div
                  className="aspect-square bg-slate-100 overflow-hidden cursor-pointer"
                  onClick={() => onPreviewImage(img.url, img.name)}
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.currentTarget.src = '/img/default-room.svg';
                    }}
                  />
                </div>
                <div className="p-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                    {img.category}
                  </span>
                  <p className="text-xs font-medium text-slate-700 truncate" title={img.name}>
                    {img.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD / EDIT ROOM MODAL */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingRoom ? `Edit Unit ${editingRoom.room_number}` : 'Tambah Unit Kamar Baru'}
              </h3>
              <button
                onClick={() => setIsRoomModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nomor Kamar *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kamar 302"
                  value={roomFormData.room_number}
                  onChange={(e) => setRoomFormData({ ...roomFormData, room_number: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-indigo-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tipe Unit *
                  </label>
                  <select
                    value={roomFormData.type}
                    onChange={(e) => setRoomFormData({ ...roomFormData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-indigo-600 outline-none bg-white"
                  >
                    <option value="Reguler">Reguler</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tarif / Bulan (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 1500000"
                    value={roomFormData.price}
                    onChange={(e) => setRoomFormData({ ...roomFormData, price: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-indigo-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Daftar Fasilitas (Pisahkan Koma)
                </label>
                <textarea
                  rows={2}
                  value={roomFormData.facilities}
                  onChange={(e) => setRoomFormData({ ...roomFormData, facilities: e.target.value })}
                  placeholder="AC, Kamar Mandi Dalam, Kasur Springbed, Lemari, WiFi"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-indigo-600 outline-none resize-none"
                />
              </div>

              {/* Upload Room Photo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Foto Unit Kamar (Extension Upload Foto)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-14 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                    <img
                      src={roomImagePreview || roomFormData.image_url || '/img/default-room.svg'}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer text-center">
                    <span>{roomImageFile ? roomImageFile.name : 'Pilih Foto Baru'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleRoomImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200"
                >
                  Simpan Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
