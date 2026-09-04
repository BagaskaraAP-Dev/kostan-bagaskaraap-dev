import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Database setup
let db;

async function initDB() {
  db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_number TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      price INTEGER NOT NULL,
      facilities TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Tersedia',
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      tenant_name TEXT NOT NULL,
      tenant_phone TEXT NOT NULL,
      check_in_date TEXT NOT NULL,
      duration_months INTEGER NOT NULL,
      total_price INTEGER NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'Menunggu Pembayaran',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms (id)
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_name TEXT NOT NULL,
      room_number TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Update room image URLs to local SVG files so images NEVER fail to load
  const sampleRooms = [
    { num: 'Kamar 101', type: 'VIP', price: 1500000, fac: 'AC, Kamar Mandi Dalam, Springbed, Lemari, WiFi 100Mbps, Smart TV', status: 'Tersedia', img: 'img/kamar-101.svg' },
    { num: 'Kamar 102', type: 'VIP', price: 1500000, fac: 'AC, Kamar Mandi Dalam, Water Heater, Meja Kerja, WiFi, Springbed', status: 'Terisi', img: 'img/kamar-102.svg' },
    { num: 'Kamar 201', type: 'Reguler', price: 850000, fac: 'Kipas Angin, Kamar Mandi Dalam, Kasur Nyaman, Lemari, WiFi', status: 'Tersedia', img: 'img/kamar-201.svg' },
    { num: 'Kamar 202', type: 'Reguler', price: 750000, fac: 'Kipas Angin, Kamar Mandi Luar Bersih, Kasur, Lemari, Dapur Bersama', status: 'Tersedia', img: 'img/kamar-202.svg' },
    { num: 'Kamar 203', type: 'Reguler', price: 850000, fac: 'Kipas Angin, Kamar Mandi Dalam, Kasur, Lemari, WiFi Cepat', status: 'Terisi', img: 'img/kamar-203.svg' },
    { num: 'Kamar 301', type: 'VIP', price: 1650000, fac: 'AC Dingin, Balkon Pribadi, Kamar Mandi Dalam, Kulkas Mini, WiFi', status: 'Tersedia', img: 'img/kamar-301.svg' }
  ];

  for (const r of sampleRooms) {
    const existing = await db.get('SELECT id FROM rooms WHERE room_number = ?', [r.num]);
    if (!existing) {
      await db.run(
        'INSERT INTO rooms (room_number, type, price, facilities, status, image_url) VALUES (?, ?, ?, ?, ?, ?)',
        [r.num, r.type, r.price, r.fac, r.status, r.img]
      );
    } else {
      // Force update to local guaranteed image URL
      await db.run('UPDATE rooms SET image_url = ? WHERE room_number = ?', [r.img, r.num]);
    }
  }
}

// ------------------------------------------------------------------
// API ENDPOINTS
// ------------------------------------------------------------------

// 1. GET ALL ROOMS
app.get('/api/rooms', async (req, res) => {
  try {
    const { type, status } = req.query;
    let query = 'SELECT * FROM rooms WHERE 1=1';
    const params = [];

    if (type && type !== 'Semua') {
      query += ' AND type = ?';
      params.push(type);
    }
    if (status && status !== 'Semua') {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY room_number ASC';
    const rooms = await db.all(query, params);
    res.json({ success: true, data: rooms });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. CREATE NEW ROOM
app.post('/api/rooms', async (req, res) => {
  try {
    const { room_number, type, price, facilities, image_url } = req.body;
    if (!room_number || !price) {
      return res.status(400).json({ success: false, error: 'Nomor kamar dan tarif wajib diisi' });
    }

    const defaultImg = image_url || '/img/default-room.svg';
    const result = await db.run(
      'INSERT INTO rooms (room_number, type, price, facilities, status, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [room_number, type || 'Reguler', Number(price), facilities || 'Fasilitas Standar', 'Tersedia', defaultImg]
    );

    res.json({ success: true, message: 'Kamar berhasil ditambahkan ke sistem', id: result.lastID });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. UPDATE ROOM STATUS
app.put('/api/rooms/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.run('UPDATE rooms SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: 'Status kamar berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. DELETE ROOM
app.delete('/api/rooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.run('DELETE FROM rooms WHERE id = ?', [id]);
    res.json({ success: true, message: 'Kamar berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. BOOKING ROOM
app.post('/api/bookings', async (req, res) => {
  try {
    const { room_id, tenant_name, tenant_phone, check_in_date, duration_months } = req.body;
    if (!room_id || !tenant_name || !tenant_phone || !check_in_date) {
      return res.status(400).json({ success: false, error: 'Data formulir tidak lengkap' });
    }

    const room = await db.get('SELECT * FROM rooms WHERE id = ?', [room_id]);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Kamar tidak ditemukan' });
    }
    if (room.status === 'Terisi') {
      return res.status(400).json({ success: false, error: 'Kamar ini sedang terisi' });
    }

    const duration = Number(duration_months) || 1;
    const totalPrice = room.price * duration;

    const result = await db.run(
      `INSERT INTO bookings (room_id, tenant_name, tenant_phone, check_in_date, duration_months, total_price, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, 'Menunggu Pembayaran')`,
      [room_id, tenant_name, tenant_phone, check_in_date, duration, totalPrice]
    );

    await db.run('UPDATE rooms SET status = ? WHERE id = ?', ['Terisi', room_id]);

    res.json({
      success: true,
      message: 'Reservasi berhasil diproses',
      bookingId: result.lastID,
      totalPrice
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. GET ALL BOOKINGS
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await db.all(`
      SELECT b.*, r.room_number, r.type as room_type
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      ORDER BY b.id DESC
    `);
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. TOGGLE PAYMENT STATUS
app.put('/api/bookings/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;
    await db.run('UPDATE bookings SET payment_status = ? WHERE id = ?', [payment_status, id]);
    res.json({ success: true, message: 'Status pembayaran diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. SUBMIT COMPLAINT
app.post('/api/complaints', async (req, res) => {
  try {
    const { tenant_name, room_number, category, description } = req.body;
    if (!tenant_name || !room_number || !description) {
      return res.status(400).json({ success: false, error: 'Data laporan tidak lengkap' });
    }

    const result = await db.run(
      'INSERT INTO complaints (tenant_name, room_number, category, description) VALUES (?, ?, ?, ?)',
      [tenant_name, room_number, category || 'Fasilitas', description]
    );

    res.json({ success: true, message: 'Laporan berhasil dicatat', id: result.lastID });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. GET ALL COMPLAINTS
app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await db.all('SELECT * FROM complaints ORDER BY id DESC');
    res.json({ success: true, data: complaints });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. UPDATE COMPLAINT STATUS
app.put('/api/complaints/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.run('UPDATE complaints SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: 'Status laporan diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. DASHBOARD SUMMARY STATS
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalRooms = await db.get('SELECT COUNT(*) as count FROM rooms');
    const occupiedRooms = await db.get("SELECT COUNT(*) as count FROM rooms WHERE status = 'Terisi'");
    const availableRooms = await db.get("SELECT COUNT(*) as count FROM rooms WHERE status = 'Tersedia'");
    const totalRevenue = await db.get("SELECT SUM(total_price) as total FROM bookings WHERE payment_status = 'Lunas'");
    const activeComplaints = await db.get("SELECT COUNT(*) as count FROM complaints WHERE status != 'Selesai'");

    res.json({
      success: true,
      data: {
        totalRooms: totalRooms.count,
        occupiedRooms: occupiedRooms.count,
        availableRooms: availableRooms.count,
        totalRevenue: totalRevenue.total || 0,
        activeComplaints: activeComplaints.count
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Server Kostan BagaskaraAP-Dev Berjalan`);
    console.log(` Halaman Utama & Reservasi : http://localhost:${PORT}`);
    console.log(` Panel Pengelola Kost      : http://localhost:${PORT}/admin.html`);
    console.log(`====================================================`);
  });
}).catch(err => {
  console.error('Inisialisasi database gagal:', err);
});
