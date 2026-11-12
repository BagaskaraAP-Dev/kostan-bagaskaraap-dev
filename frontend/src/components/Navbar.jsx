import React from 'react';
import { Home, ShieldCheck, Wrench, Image as ImageIcon, Sparkles, Building2 } from 'lucide-react';

export default function Navbar({ activeView, setActiveView, availableCount }) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <button
            onClick={() => setActiveView('public')}
            className="flex items-center gap-3 group text-left transition focus:outline-none"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-400 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-indigo-600 transition">
                  Kostan BagaskaraAP
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                  {availableCount ?? '...'} Tersedia
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Sistem Reservasi & Pengelolaan Kost Modern
              </p>
            </div>
          </button>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveView('public')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeView === 'public'
                  ? 'bg-slate-100 text-indigo-600 shadow-inner'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
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
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition"
            >
              <Wrench className="w-4 h-4 text-amber-500" />
              <span className="hidden md:inline">Pengaduan</span>
            </a>

            <button
              onClick={() => setActiveView('admin')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm ${
                activeView === 'admin'
                  ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-md ring-2 ring-indigo-600 ring-offset-2'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Panel Pengelola</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
