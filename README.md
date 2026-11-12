# 🏢 Kostan BagaskaraAP-Dev — Modern Full-Stack Platform (v2.0)

[![Docker](https://img.shields.io/badge/Docker-Ready%20%26%20Containerized-blue?logo=docker)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express%20v4-green?logo=node.js)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL%20Persistent-003B57?logo=sqlite)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

Aplikasi Web **Full-Stack Modern** untuk manajemen unit kamar kost, sistem reservasi digital dengan unggah bukti transfer, penanganan keluhan/kendala fasilitas dengan bukti foto kerusakan, serta panel admin pengelola dengan dashboard analitik dan manajemen media.

---

## 🚀 Fitur Unggulan & Ekstensi Baru

### 1. 🖼️ Ekstensi Unggah & Manajemen Gambar (Image Extension)
- **Foto Unit Kamar Realistis**: Admin dapat mengunggah gambar kamar baru atau mengubah foto kamar yang sudah ada langsung dari perangkat (disimpan di `/uploads/rooms/`).
- **Bukti Pembayaran / DP (Payment Proof)**: Calon penyewa dapat melampirkan foto struk / bukti transfer bank / e-wallet saat melakukan reservasi.
- **Bukti Foto Kerusakan Fasilitas**: Penghuni dapat melampirkan foto kendala (AC bocor, genteng, shower mampet, saklar rusak) saat mengisi formulir pengaduan teknisi.
- **Media Gallery & Manager**: Panel khusus untuk meninjau seluruh aset gambar yang diunggah, memfilter berdasarkan kategori, dan copy URL.
- **Lightbox Zoom Viewer**: Klik gambar apa saja di kartu kamar, daftar reservasi, atau pengaduan untuk melihat tampilan resolusi penuh (*full-screen preview*).

### 2. ⚡ Vibe Coding & Frontend Modern
- Ditenagai **React 18**, **Vite**, **Tailwind CSS**, dan **Lucide Icons**.
- **Live Search & Filter Chips**: Filter instan berdasarkan tipe kamar (VIP / Reguler) dan status ketersediaan.
- **Desain Bersih & Responsif**: Tampilan mobile-first yang nyaman dibuka di smartphone maupun desktop.
- **Toast Notifications**: Notifikasi dinamis untuk setiap interaksi sistem.

### 3. 🛡️ Panel Pengelola Kost (Admin Dashboard)
- **Statistik & Metrik**: Total unit, kamar terisi, kamar kosong, *occupancy rate* (%), omset pembayaran sewa lunas, dan kendala aktif.
- **Manajemen Kamar (CRUD)**: Tambah kamar dengan unggah foto, edit tarif, ubah fasilitas, dan hapus unit.
- **Verifikasi Reservasi**: Tinjau data penyewa, no WhatsApp, durasi sewa, lihat struk bukti bayar, dan setujui / batalkan status pembayaran.
- **Pelacakan Gangguan**: Kelola laporan kendala dari status `Pending` $\to$ `Diproses` $\to$ `Selesai`.

### 4. 🐳 Full Docker & Cloud Deploy Ready
- **Multi-Container Microservices**: Menggunakan `docker-compose.yml` untuk memisahkan service Frontend (Nginx) dan Backend (Node.js API) dengan volume persisten untuk database SQLite dan direktori file upload.
- **Single-Container Multi-Stage Build**: Dilengkapi `Dockerfile` root untuk kemudahan 1-click deploy pada penyedia PaaS/VPS seperti Render, Railway, Fly.io, Google Cloud Run, atau VPS Linux.

---

## 🏗️ Struktur Arsitektur Monorepo

```text
kostan-bagaskaraap-dev/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Inisialisasi SQLite3, auto migration & seeding
│   │   ├── controllers/             # Room, Booking, Complaint, Dashboard, & Upload logic
│   │   ├── middleware/              # Multer upload handler (limit 10MB, mime filter)
│   │   ├── routes/                  # Express REST API routes (/api/*)
│   │   └── server.js                # Server entry point
│   ├── uploads/                     # Persistent storage file upload (rooms, complaints, bookings)
│   ├── Dockerfile                   # Docker build backend
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/              # Navbar, Hero, RoomCard, BookingModal, ComplaintSection, AdminDashboard, Lightbox
│   │   ├── services/api.js          # Client API caller & helper currency rupiah
│   │   ├── App.jsx                  # Single Page Application router/view switcher
│   │   └── index.css                # Tailwind CSS layers
│   ├── nginx.conf                   # Nginx reverse proxy untuk Docker frontend
│   ├── Dockerfile                   # Docker build frontend (Vite builder -> Nginx alpine)
│   └── package.json
│
├── docker-compose.yml               # Orkestrasi multi-container
├── Dockerfile                       # Multi-stage build 1-kontainer siap deploy ke cloud
├── .env.example
└── README.md
```

---

## 🏃 Cara Menjalankan dengan Docker (Paling Direkomendasikan)

Pastikan Docker Desktop sudah terpasang dan berjalan di komputer Anda.

### 1. Jalankan Seluruh Sistem dengan Satu Perintah
```bash
docker compose up -d --build
```

Setelah proses build selesai, buka peramban (*browser*):
- 🌐 **Halaman Utama & Reservasi Kost:** `http://localhost:3000`
- ⚙️ **Panel Pengelola Kost (Admin):** Klik tombol **Panel Pengelola** di navbar atas kanan (`http://localhost:3000`)
- 🔌 **REST API Backend:** `http://localhost:5000/api/health`

### 2. Memeriksa Status Kontainer & Log
```bash
# Melihat log backend & frontend secara langsung
docker compose logs -f

# Menghentikan layanan
docker compose down
```

> **Data Persistensi:** Database SQLite dan file gambar yang diunggah disimpan di Docker Named Volumes (`kostan_data` dan `kostan_uploads`), sehingga data tidak akan hilang saat kontainer direstart atau dibuild ulang.

---

## 💻 Cara Menjalankan Secara Lokal (Development / Vibe Coding)

Jika Anda ingin melakukan *live editing* kode dengan *hot-module-replacement* (HMR):

### 1. Jalankan Backend API
```bash
cd backend
npm install
npm run dev
```
Backend berjalan di `http://localhost:5000`.

### 2. Jalankan Frontend (Terminal Terpisah)
```bash
cd frontend
npm install
npm run dev
```
Frontend berjalan di `http://localhost:3000` dengan Vite proxy otomatis ke backend `http://localhost:5000`.

---

## 🌐 Panduan Deploy ke Layanan Cloud

Aplikasi ini dirancang *cloud-native* dan dapat dideploy ke berbagai platform gratis maupun berbayar:

### Opsi A: Deploy ke Railway / Render / Fly.io (Single-Container Multi-Stage)
Repository ini menyertakan `Dockerfile` root multi-stage:
1. Hubungkan akun GitHub Anda ke [Railway](https://railway.app/) atau [Render](https://render.com/).
2. Buat layanan baru (*New Web Service*) dan pilih repository ini.
3. Railway / Render akan mendeteksi root `Dockerfile` secara otomatis:
   - Tahap 1: Membangun frontend React + Tailwind ke `dist/`.
   - Tahap 2: Menyiapkan backend Node.js dan menyajikan API sekaligus file frontend statis pada port yang sama.
4. Tambahkan Persistent Volume (opsional jika ingin menyimpan upload & database secara permanen pada mount `/app/backend/data` dan `/app/backend/uploads`).

### Opsi B: Deploy ke VPS Linux (Ubuntu / Debian dengan Docker Compose)
1. SSH ke VPS Anda:
   ```bash
   git clone https://github.com/BagaskaraAP-Dev/kostan-bagaskaraap-dev.git
   cd kostan-bagaskaraap-dev
   docker compose up -d --build
   ```
2. Hubungkan domain Anda ke port `3000` (atau pasang Certbot SSL / Reverse Proxy Cloudflare / Nginx Proxy Manager).

---

## 📡 Daftar REST API Endpoints

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Status kesehatan server |
| `GET` | `/api/rooms` | Daftar seluruh kamar (filter `?type=` dan `?status=`) |
| `POST` | `/api/rooms` | Tambah unit kamar baru (mendukung upload gambar multipart) |
| `PUT` | `/api/rooms/:id` | Perbarui data kamar & gambar |
| `PUT` | `/api/rooms/:id/status` | Ubah status kamar (`Tersedia`, `Terisi`, `Renovasi`) |
| `DELETE` | `/api/rooms/:id` | Hapus unit kamar |
| `GET` | `/api/bookings` | Daftar seluruh data reservasi sewa |
| `POST` | `/api/bookings` | Buat reservasi kamar baru (mendukung upload bukti transfer) |
| `PUT` | `/api/bookings/:id/payment` | Perbarui status pembayaran sewa (`Lunas`, `Menunggu Pembayaran`, `Ditolak`) |
| `DELETE` | `/api/bookings/:id` | Hapus data reservasi |
| `GET` | `/api/complaints` | Daftar laporan kendala / pengaduan fasilitas |
| `POST` | `/api/complaints` | Buat laporan kendala (mendukung lampiran foto kerusakan) |
| `PUT` | `/api/complaints/:id/status` | Ubah status pengerjaan (`Pending`, `Diproses`, `Selesai`) |
| `GET` | `/api/dashboard/stats` | Ringkasan statistik & metrik keuangan kostan |
| `POST` | `/api/upload` | Ekstensi upload file gambar bebas |
| `GET` | `/api/upload/gallery` | Daftar seluruh aset gambar yang pernah diunggah |

---

## 🤝 Vibe Coding dengan Antigravity

Repository ini dioptimalkan untuk eksplorasi **vibe coding** dengan **Google Antigravity AI**:
- Modul frontend terpisah secara komponen atomik (`components/`).
- Endpoint backend tertata modular (`controllers/`, `middleware/`, `routes/`, `config/`).
- Pengujian build langsung dilakukan di setiap iterasi tanpa merusak dependensi lokal.

Selamat mencoba dan mengembangkan sistem ini lebih jauh! 🚀
