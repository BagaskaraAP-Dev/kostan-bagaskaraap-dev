import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import RoomCard from './components/RoomCard';
import BookingModal from './components/BookingModal';
import ComplaintSection from './components/ComplaintSection';
import AdminDashboard from './components/AdminDashboard';
import ImageLightboxModal from './components/ImageLightboxModal';
import { fetchRooms } from './services/api';
import { Search, Sparkles, Filter, CheckCircle2, AlertCircle, Heart, Layers, Container, Code2 } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('public'); // 'public' | 'admin'
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null); // { url, title }

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadRooms = async () => {
    try {
      setLoadingRooms(true);
      const data = await fetchRooms({
        type: selectedType,
        status: selectedStatus,
        search: searchQuery
      });
      setRooms(data);
    } catch (err) {
      showToast(err.message || 'Gagal memuat unit kamar', 'error');
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, [selectedType, selectedStatus, searchQuery]);

  const availableCount = rooms.filter((r) => r.status === 'Tersedia').length;

  const handleBookingSuccess = (msg) => {
    showToast(msg, 'success');
    loadRooms();
  };

  const handleComplaintSuccess = (msg) => {
    showToast(msg, 'success');
  };

  const scrollToCatalog = () => {
    document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-sm font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-200'
                : 'bg-rose-600 text-white border-rose-500 shadow-rose-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <ImageLightboxModal
          imageUrl={lightboxImage.url}
          title={lightboxImage.title}
          onClose={() => setLightboxImage(null)}
        />
      )}

      {/* Booking Modal */}
      {selectedRoomForBooking && (
        <BookingModal
          room={selectedRoomForBooking}
          onClose={() => setSelectedRoomForBooking(null)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* Navigation */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        availableCount={availableCount}
      />

      {/* MAIN VIEW SWITCHER */}
      {activeView === 'public' ? (
        <main className="flex-1">
          {/* Hero Section */}
          <Hero onExploreClick={scrollToCatalog} />

          {/* Catalog Section */}
          <section id="katalog" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Daftar Unit Kamar</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
                    {rooms.length} Unit
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Pilih kamar sesuai fasilitas dan budget Anda
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari kamar / fasilitas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                />
              </div>
            </div>

            {/* Filter Chips Bar */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              {/* Type Filter */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wider">Tipe:</span>
                {['Semua', 'VIP', 'Reguler'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      selectedType === type
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wider">Status:</span>
                {['Semua', 'Tersedia'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      selectedStatus === status
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {status === 'Tersedia' ? 'Hanya Tersedia' : 'Semua Status'}
                  </button>
                ))}
              </div>
            </div>

            {/* Room Grid */}
            {loadingRooms ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-semibold text-slate-500">Memuat katalog kamar...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8">
                <p className="text-base font-bold text-slate-700">Tidak ada kamar yang cocok</p>
                <p className="text-xs text-slate-400 mt-1">Coba ubah filter pencarian atau tipe unit</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onBook={(r) => setSelectedRoomForBooking(r)}
                    onPreviewImage={(url, title) => setLightboxImage({ url, title })}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Layanan Pengaduan */}
          <ComplaintSection onSuccess={handleComplaintSuccess} />
        </main>
      ) : (
        /* ADMIN DASHBOARD VIEW */
        <main className="flex-1 bg-slate-50">
          <AdminDashboard
            onPreviewImage={(url, title) => setLightboxImage({ url, title })}
            notify={showToast}
          />
        </main>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-white font-extrabold text-lg">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs">
                  B
                </div>
                <span>Kostan BagaskaraAP-Dev</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">
                Modern Full-Stack Architecture • React + Tailwind CSS + Node.js Express + SQLite + Docker
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                <Container className="w-3.5 h-3.5 text-cyan-400" />
                Full Docker Ready
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Vibe Coding Antigravity
              </span>
              <a
                href="https://github.com/BagaskaraAP-Dev/kostan-bagaskaraap-dev"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
              >
                <Code2 className="w-3.5 h-3.5" />
                GitHub Repo
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800/80 text-center text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Kostan BagaskaraAP-Dev. All rights reserved. Built with Antigravity AI.
          </div>
        </div>
      </footer>
    </div>
  );
}
