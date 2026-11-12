import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data folder exists
const dataDir = process.env.DATA_DIR || path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'kostan.sqlite');

let dbInstance = null;

export async function getDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys & WAL mode for concurrency
  await dbInstance.run('PRAGMA foreign_keys = ON;');
  await dbInstance.run('PRAGMA journal_mode = WAL;');

  await initTables(dbInstance);
  await seedDefaultRooms(dbInstance);

  return dbInstance;
}

async function initTables(db) {
  // Rooms table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_number TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      price INTEGER NOT NULL,
      facilities TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Tersedia',
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Bookings table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      tenant_name TEXT NOT NULL,
      tenant_phone TEXT NOT NULL,
      check_in_date TEXT NOT NULL,
      duration_months INTEGER NOT NULL,
      total_price INTEGER NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'Menunggu Pembayaran',
      payment_proof TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE
    );
  `);

  // Complaints table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_name TEXT NOT NULL,
      room_number TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      photo_url TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migration checks in case columns don't exist yet
  try {
    await db.exec(`ALTER TABLE bookings ADD COLUMN payment_proof TEXT;`);
  } catch (e) {
    // Column already exists
  }

  try {
    await db.exec(`ALTER TABLE bookings ADD COLUMN notes TEXT;`);
  } catch (e) {
    // Column already exists
  }

  try {
    await db.exec(`ALTER TABLE complaints ADD COLUMN photo_url TEXT;`);
  } catch (e) {
    // Column already exists
  }
}

async function seedDefaultRooms(db) {
  const countRes = await db.get('SELECT COUNT(*) as count FROM rooms');
  if (countRes && countRes.count > 0) return;

  const defaultRooms = [
    {
      num: 'Kamar 101',
      type: 'VIP',
      price: 1500000,
      fac: 'AC, Kamar Mandi Dalam, Springbed King, Lemari 2 Pintu, Smart TV, WiFi 100Mbps',
      status: 'Tersedia',
      img: '/uploads/rooms/kamar-101.svg'
    },
    {
      num: 'Kamar 102',
      type: 'VIP',
      price: 1500000,
      fac: 'AC, Kamar Mandi Dalam, Water Heater, Meja Kerja Ergonomis, WiFi Cepat, Springbed',
      status: 'Terisi',
      img: '/uploads/rooms/kamar-102.svg'
    },
    {
      num: 'Kamar 201',
      type: 'Reguler',
      price: 850000,
      fac: 'Kipas Angin Dinding, Kamar Mandi Dalam, Kasur Busa Empuk, Lemari, WiFi 50Mbps',
      status: 'Tersedia',
      img: '/uploads/rooms/kamar-201.svg'
    },
    {
      num: 'Kamar 202',
      type: 'Reguler',
      price: 750000,
      fac: 'Kipas Angin, Kamar Mandi Luar Bersih, Kasur Single, Lemari, Akses Dapur Bersama',
      status: 'Tersedia',
      img: '/uploads/rooms/kamar-202.svg'
    },
    {
      num: 'Kamar 203',
      type: 'Reguler',
      price: 850000,
      fac: 'Kipas Angin Dinding, Kamar Mandi Dalam, Kasur Springbed, Meja Belajar, WiFi',
      status: 'Terisi',
      img: '/uploads/rooms/kamar-203.svg'
    },
    {
      num: 'Kamar 301',
      type: 'VIP',
      price: 1650000,
      fac: 'AC Dingin 1PK, Balkon View Cantik, Kamar Mandi Dalam Water Heater, Kulkas Mini, Smart TV',
      status: 'Tersedia',
      img: '/uploads/rooms/kamar-301.svg'
    }
  ];

  for (const r of defaultRooms) {
    await db.run(
      `INSERT INTO rooms (room_number, type, price, facilities, status, image_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [r.num, r.type, r.price, r.fac, r.status, r.img]
    );
  }
}
