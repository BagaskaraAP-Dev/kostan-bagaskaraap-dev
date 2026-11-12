import React, { useState } from 'react';
import { X, Upload, CheckCircle, Image as ImageIcon, Calendar, Phone, User, Clock, AlertCircle } from 'lucide-react';
import { formatRupiah, createBooking } from '../services/api';

export default function BookingModal({ room, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    tenant_name: '',
    tenant_phone: '',
    check_in_date: new Date().toISOString().split('T')[0],
    duration_months: 1,
    notes: ''
  });

  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!room) return null;

  const duration = Number(formData.duration_months) || 1;
  const totalPrice = room.price * duration;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Ukuran file bukti pembayaran maksimal 10MB');
        return;
      }
      setPaymentProofFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const removeFile = () => {
    setPaymentProofFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = new FormData();
      data.append('room_id', room.id);
      data.append('tenant_name', formData.tenant_name);
      data.append('tenant_phone', formData.tenant_phone);
      data.append('check_in_date', formData.check_in_date);
      data.append('duration_months', formData.duration_months);
      data.append('notes', formData.notes || '');

      if (paymentProofFile) {
        data.append('payment_proof', paymentProofFile);
      }

      await createBooking(data);
      onSuccess(`Reservasi untuk ${room.room_number} berhasil dikirim! Total: ${formatRupiah(totalPrice)}`);
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal mengirim reservasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">Formulir Reservasi Kamar</h3>
            <p className="text-xs text-slate-500">Konfirmasi pemesanan dan bukti transaksi sewa</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Room Preview */}
        <div className="px-6 pt-4 pb-2 bg-indigo-50/50 border-b border-indigo-100/70 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">{room.type} Room</span>
            <h4 className="text-base font-bold text-slate-900">{room.room_number}</h4>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Tarif Pokok</span>
            <span className="text-sm font-bold text-indigo-700">{formatRupiah(room.price)} /bln</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Lengkap Penyewa *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Sesuai KTP / identitas resmi"
                value={formData.tenant_name}
                onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nomor WhatsApp / HP *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                placeholder="0812xxxxxxxx"
                value={formData.tenant_phone}
                onChange={(e) => setFormData({ ...formData, tenant_phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mulai Check-in *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={formData.check_in_date}
                  onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                  className="w-full pl-9 pr-2 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Durasi Sewa *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={formData.duration_months}
                  onChange={(e) => setFormData({ ...formData, duration_months: Number(e.target.value) })}
                  className="w-full pl-9 pr-2 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition bg-white"
                >
                  <option value={1}>1 Bulan</option>
                  <option value={3}>3 Bulan</option>
                  <option value={6}>6 Bulan</option>
                  <option value={12}>1 Tahun (12 Bulan)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Image Extension: Upload Bukti Transfer */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Upload Bukti Transfer / DP (Opsional)
            </label>
            {!previewUrl ? (
              <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-indigo-50/40 transition">
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-slate-700">Pilih foto struk / bukti transfer</span>
                <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP hingga 10MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 p-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={previewUrl}
                    alt="Bukti Transfer"
                    className="w-12 h-12 object-cover rounded-lg border border-slate-200 shadow-xs"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block truncate max-w-[200px]">
                      {paymentProofFile?.name}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Foto siap diunggah
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Total Calculation Box */}
          <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200/80 text-center">
            <span className="text-xs font-medium text-slate-600 block">Total Biaya Sewa ({duration} Bulan):</span>
            <div className="text-2xl font-black text-indigo-700 tracking-tight mt-0.5">
              {formatRupiah(totalPrice)}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Konfirmasi langsung dikirimkan ke kontak Anda
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Konfirmasi Reservasi</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
