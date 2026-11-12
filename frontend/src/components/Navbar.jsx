import React from 'react';
import { Home, ShieldCheck, Wrench, Building2 } from 'lucide-react';

export default function Navbar({ activeView, setActiveView, availableCount }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <button
            onClick={() => setActiveView('public')}
            className="flex items-center gap-3 text-left focus-visible:outline-indigo-600 focus-visible:outline-2 rounded-xl"
            aria-label="Kembali ke halaman utama katalog kostan"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-indigo-700 flex items-center justify-center text-white font-extrabold text-xl shadow-xs">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 hover:text-indigo-700 transition-colors">
                  Kostan BagaskaraAP
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5" aria-hidden="true"></span>
                  {availableCount ?? '...'} Tersedia
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium hidden sm:block">
                Sistem Reservasi & Pengelolaan Kost
              </p>
            </div>
          </button>

          {/* Navigation Buttons */}
          <nav aria-label="Navigasi Utama" className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveView('public')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-indigo-600 focus-visible:outline-2 ${
                activeView === 'public'
                  ? 'bg-slate-100 text-indigo-700'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Katalog</span>
            </button>

            <a
              href="#pengaduan"
              onClick={(e) => {
                if (activeView !== 'public') {
                  e.preventDefault();
                  setActiveView('public');
                  setTimeout(() => {
                    document.getElementById('pengaduan')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-indigo-600 focus-visible:outline-2"
            >
              <Wrench className="w-4 h-4 text-amber-600" />
              <span className="hidden md:inline">Pengaduan</span>
            </a>

            <button
              onClick={() => setActiveView('admin')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-indigo-600 focus-visible:outline-2 ${
                activeView === 'admin'
                  ? 'bg-indigo-700 text-white'
                  : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Panel Pengelola</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
