import React, { useState } from 'react';
import { Wrench, Upload, X, CheckCircle, AlertCircle, Send, Camera } from 'lucide-react';
import { createComplaint } from '../services/api';

export default function ComplaintSection({ onSuccess }) {
  const [formData, setFormData] = useState({
    tenant_name: '',
    room_number: '',
    category: 'Fasilitas Kamar',
    description: ''
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Ukuran foto maksimal 10MB');
        return;
      }
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = new FormData();
      data.append('tenant_name', formData.tenant_name);
      data.append('room_number', formData.room_number);
      data.append('category', formData.category);
      data.append('description', formData.description);

      if (photoFile) {
        data.append('photo', photoFile);
      }

      await createComplaint(data);
      onSuccess('Laporan kendala fasilitas berhasil dikirim! Tim teknisi akan segera memeriksa.');

      // Reset form
      setFormData({
        tenant_name: '',
        room_number: '',
        category: 'Fasilitas Kamar',
        description: ''
      });
      removePhoto();
    } catch (err) {
      setError(err.message || 'Gagal mengirim pengaduan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="pengaduan" className="py-16 bg-slate-100/70 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold backdrop-blur-xs mb-3 border border-white/10">
              <Wrench className="w-3.5 h-3.5" />
              <span>Layanan Respon Cepat Pengelola Kost</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Formulir Pengaduan Kendala Fasilitas
            </h2>
            <p className="mt-2 text-indigo-200 text-xs sm:text-sm max-w-xl">
              Laporkan masalah air, listrik, WiFi, atau kerusakan perabot kamar Anda beserta lampiran foto bukti kerusakan agar segera ditangani tim teknisi.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Penghuni *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bagas Pratama"
                  value={formData.tenant_name}
                  onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nomor Kamar *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kamar 101"
                  value={formData.room_number}
                  onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kategori Gangguan *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition bg-white"
              >
                <option value="Listrik dan Penerangan">Listrik & Penerangan (Lampu mati, MCB jeglek, saklar)</option>
                <option value="Air dan Pipa">Air Bersih & Pipa (Kran bocor, shower, toilet mampet)</option>
                <option value="Fasilitas Kamar">Fasilitas Kamar (AC tidak dingin, kasur, lemari, kunci pintu)</option>
                <option value="WiFi dan Jaringan">Jaringan Internet / WiFi (Sinyal lemah, putus nyambung)</option>
                <option value="Kebersihan & Lainnya">Kebersihan Lingkungan & Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Detail Deskripsi Kendala *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Ceritakan detail kendala secara jelas (lokasi, waktu mulai terjadi, dan kondisinya)..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition resize-none"
              />
            </div>

            {/* Image Extension: Attach photo evidence */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Foto Bukti Kendala / Kerusakan (Extension Fitur Gambar)
              </label>

              {!previewUrl ? (
                <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-indigo-50/30 transition group">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Lampirkan foto kendala (Kamera / Galeri)</span>
                  <span className="text-xs text-slate-400 mt-1">Format JPG, PNG, WEBP hingga 10MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={previewUrl}
                      alt="Bukti Kerusakan"
                      className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-xs"
                    />
                    <div>
                      <span className="text-sm font-semibold text-slate-800 block truncate max-w-xs">
                        {photoFile?.name}
                      </span>
                      <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5" /> Foto terlampir
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Hapus foto"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Mengirim Laporan...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Pengaduan ke Pengelola</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
