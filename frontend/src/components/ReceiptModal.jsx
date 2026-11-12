import React, { useEffect } from 'react';
import { X, Printer, MessageSquare, CheckCircle, Building2, Calendar, User, Phone, DollarSign } from 'lucide-react';
import { formatRupiah } from '../services/api';

export default function ReceiptModal({ booking, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!booking) return null;

  const receiptNo = `INV-KOST-${String(booking.id).padStart(4, '0')}`;
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const cleanPhone = (booking.tenant_phone || '').replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone;
  const waMessage = encodeURIComponent(
    `Halo ${booking.tenant_name}, berikut konfirmasi pembayaran sewa Kostan BagaskaraAP-Dev:\n` +
    `No. Kuitansi: ${receiptNo}\n` +
    `Kamar: ${booking.room_number}\n` +
    `Durasi: ${booking.duration_months} Bulan (Mulai ${booking.check_in_date})\n` +
    `Total: ${formatRupiah(booking.total_price)}\n` +
    `Status: ${booking.payment_status}\n` +
    `Terima kasih telah mempercayakan hunian Anda bersama kami!`
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 print:m-0 print:border-none print:shadow-none animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Bar (hidden on print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50 print:hidden">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kuitansi Pembayaran</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            {waPhone && (
              <a
                href={`https://wa.me/${waPhone}?text=${waMessage}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Kirim WhatsApp</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              aria-label="Tutup kuitansi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-8 font-sans text-slate-800" id="printable-receipt">
          {/* Header */}
          <div className="border-b border-slate-200 pb-5 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-700 text-white font-extrabold flex items-center justify-center text-lg">
                  B
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                    Kostan BagaskaraAP-Dev
                  </h2>
                  <p className="text-xs text-slate-500">Sistem Manajemen & Bukti Transaksi Resmi</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">No. Kuitansi</span>
                <span className="font-mono text-sm font-bold text-indigo-700">{receiptNo}</span>
              </div>
            </div>
          </div>

          {/* Receipt Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <span className="text-slate-400 block mb-0.5">Nama Penyewa:</span>
              <span className="font-bold text-slate-900 text-sm block">{booking.tenant_name}</span>
              <span className="text-slate-500">{booking.tenant_phone}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Unit Kamar:</span>
              <span className="font-bold text-slate-900 text-sm block">{booking.room_number}</span>
              <span className="text-slate-500">{booking.room_type || 'Reguler'} Room</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Mulai Check-In:</span>
              <span className="font-semibold text-slate-800">{booking.check_in_date}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Durasi Sewa:</span>
              <span className="font-semibold text-slate-800">{booking.duration_months} Bulan</span>
            </div>
          </div>

          {/* Line Items */}
          <table className="w-full text-xs text-left mb-6">
            <thead className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-2">Deskripsi Pembayaran</th>
                <th className="py-2 text-right">Durasi</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3">
                  <span className="font-bold text-slate-800 block">Sewa Unit {booking.room_number}</span>
                  <span className="text-slate-500">Termasuk fasilitas standar & akses WiFi</span>
                </td>
                <td className="py-3 text-right font-medium text-slate-700">{booking.duration_months} Bulan</td>
                <td className="py-3 text-right font-bold text-slate-900">{formatRupiah(booking.total_price)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200">
                <td colSpan="2" className="pt-3 font-bold text-slate-900 text-sm">Total Tagihan</td>
                <td className="pt-3 text-right font-black text-indigo-700 text-base">
                  {formatRupiah(booking.total_price)}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Status Stamp & Signature */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Status Pembayaran:</span>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-md font-bold uppercase text-[11px] tracking-wider border ${
                  booking.payment_status === 'Lunas'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {booking.payment_status}
              </span>
            </div>

            <div className="text-right">
              <span className="text-slate-400 block">{currentDate}</span>
              <span className="font-bold text-slate-800 block mt-4">Pengelola Kostan</span>
              <span className="text-[11px] text-slate-500">BagaskaraAP-Dev</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
