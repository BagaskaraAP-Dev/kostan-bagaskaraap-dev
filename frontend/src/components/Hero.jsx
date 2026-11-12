import React from 'react';
import { Wifi, ShieldCheck, Sparkles, BedDouble, Bath, ArrowDownCircle } from 'lucide-react';

export default function Hero({ onExploreClick }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 py-12 sm:py-16 border-b border-slate-200/80">
      <div className="absolute inset-0 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 text-indigo-800 text-xs sm:text-sm font-semibold mb-6 border border-indigo-200 shadow-xs">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Hunian Nyaman, Fasilitas Lengkap & Akses 24 Jam</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          Temukan Kamar Impian di <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-500 bg-clip-text text-transparent">
            Kostan BagaskaraAP-Dev
          </span>
        </h1>

        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Sistem informasi ketersediaan kamar real-time, spesifikasi fasilitas transparan, upload bukti pembayaran digital, dan penanganan kendala yang responsif.
        </p>

        {/* Feature Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium text-slate-700">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white shadow-xs border border-slate-200">
            <Wifi className="w-4 h-4 text-indigo-600" />
            <span>WiFi High Speed 100Mbps</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white shadow-xs border border-slate-200">
            <Bath className="w-4 h-4 text-cyan-600" />
            <span>Kamar Mandi Dalam / Water Heater</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white shadow-xs border border-slate-200">
            <BedDouble className="w-4 h-4 text-emerald-600" />
            <span>Springbed Berkualitas</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white shadow-xs border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>CCTV & Keamanan 24 Jam</span>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onExploreClick}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"
          >
            <span>Lihat Daftar Kamar Tersedia</span>
            <ArrowDownCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
