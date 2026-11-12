import React from 'react';
import { Wifi, ShieldCheck, BedDouble, Bath, ArrowDownCircle } from 'lucide-react';

export default function Hero({ onExploreClick }) {
  return (
    <section className="bg-slate-50 py-12 sm:py-16 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
          Ketersediaan Kamar & Reservasi Langsung di <br className="hidden sm:inline" />
          <span className="text-indigo-700">Kostan BagaskaraAP-Dev</span>
        </h1>

        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed">
          Pengecekan fasilitas transparan, reservasi kamar langsung dengan upload bukti transfer, serta layanan pelaporan kendala fasilitas secara digital.
        </p>

        {/* Feature Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm font-semibold text-slate-800">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <Wifi className="w-4 h-4 text-indigo-700" />
            <span>WiFi High Speed 100Mbps</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <Bath className="w-4 h-4 text-cyan-700" />
            <span>Kamar Mandi Dalam & Water Heater</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <BedDouble className="w-4 h-4 text-emerald-700" />
            <span>Springbed Berkualitas</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>CCTV & Keamanan 24 Jam</span>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onExploreClick}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 text-white font-bold text-sm shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            <span>Lihat Daftar Kamar Tersedia</span>
            <ArrowDownCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
