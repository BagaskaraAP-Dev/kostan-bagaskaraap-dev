# Kostan BagaskaraAP-Dev - Sistem Manajemen & Reservasi Kamar

Aplikasi Web Full-Stack modern untuk pengelolaan unit kamar kost, reservasi kamar, pencatatan pembayaran sewa, dan penanganan laporan kendala fasilitas penghuni.

Dikembangkan oleh **BagaskaraAP-Dev** (Bagaskara Amukti Palapa).

---

## Spesifikasi Teknis
- **Backend:** Node.js, Express.js (REST API)
- **Database:** SQLite3 (database relasional lokal, file `database.sqlite`)
- **Frontend:** Semantic HTML5, CSS kustom responsif, Vanilla JavaScript
- **Aset Gambar:** Vektor SVG lokal mandiri (bebas dependensi jaringan eksternal)

---

## Fitur Utama
1. **Halaman Publik & Reservasi (`index.html`)**:
   - Filter kamar berdasarkan tipe (Semua, VIP, Reguler) dan status ketersediaan.
   - Formulir pemesanan kamar dengan penghitungan total biaya sewa.
   - Formulir pengaduan kendala fasilitas (listrik, air, kamar, jaringan internet).
2. **Panel Pengelola (`admin.html`)**:
   - Ringkasan statistik (total kamar, kamar terisi, kamar kosong, omset pembayaran lunas, kendala aktif).
   - Manajemen unit kamar (tambah kamar baru, ubah status ketersediaan, hapus unit).
   - Verifikasi status pembayaran sewa penghuni.
   - Pembaruan status penanganan laporan kendala (Pending, Diproses, Selesai).

---

## Menjalankan Server Lokal
```bash
cd /home/mooncrust/project
node server.js
```
Akses di peramban:
- Halaman Reservasi: `http://localhost:5000`
- Panel Pengelola: `http://localhost:5000/admin.html`
