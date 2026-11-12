import React from 'react';
import { formatRupiah } from '../services/api';
import { Check, Sparkles, Bed, Image as ImageIcon, CheckCircle2, XCircle } from 'lucide-react';

export default function RoomCard({ room, onBook, onPreviewImage }) {
  const isAvailable = room.status === 'Tersedia';
  const facilitiesList = room.facilities ? room.facilities.split(',').map((f) => f.trim()) : [];

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col">
      {/* Image Container with Badges */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onPreviewImage(room.image_url, room.room_number)}>
        <img
          src={room.image_url || '/img/default-room.svg'}
          alt={room.room_number}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = '/img/default-room.svg';
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <span className="text-white text-xs font-medium flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-md backdrop-blur-xs">
            <ImageIcon className="w-3.5 h-3.5" />
            Klik untuk perbesar foto
          </span>
        </div>

        {/* Badges on Image */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide shadow-xs ${
              room.type === 'VIP'
                ? 'bg-amber-500 text-white'
                : 'bg-indigo-600 text-white'
            }`}
          >
            {room.type}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1 ${
              isAvailable
                ? 'bg-emerald-500 text-white'
                : room.status === 'Terisi'
                ? 'bg-rose-500 text-white'
                : 'bg-slate-500 text-white'
            }`}
          >
            {isAvailable ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
            {room.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition">
              {room.room_number}
            </h3>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Tarif Sewa</span>
              <span className="text-base font-extrabold text-indigo-600">
                {formatRupiah(room.price)}
                <span className="text-xs font-normal text-slate-500"> /bln</span>
              </span>
            </div>
          </div>

          {/* Facility tags */}
          <div className="my-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Fasilitas Kamar:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {facilitiesList.slice(0, 4).map((fac, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                >
                  {fac}
                </span>
              ))}
              {facilitiesList.length > 4 && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-700">
                  +{facilitiesList.length - 4} lainnya
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
          {isAvailable ? (
            <button
              onClick={() => onBook(room)}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-sm hover:shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Reservasi Kamar</span>
            </button>
          ) : (
            <button
              disabled
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-400 font-semibold text-sm cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>Sedang Terisi</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
