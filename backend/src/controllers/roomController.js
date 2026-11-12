import { getDB } from '../config/database.js';

export const getRooms = async (req, res, next) => {
  try {
    const db = await getDB();
    const { type, status, search } = req.query;
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
    if (search && search.trim() !== '') {
      query += ' AND (room_number LIKE ? OR facilities LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += ' ORDER BY room_number ASC';
    const rooms = await db.all(query, params);

    res.json({ success: true, count: rooms.length, data: rooms });
  } catch (err) {
    next(err);
  }
};

export const getRoomById = async (req, res, next) => {
  try {
    const db = await getDB();
    const { id } = req.params;
    const room = await db.get('SELECT * FROM rooms WHERE id = ?', [id]);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Kamar tidak ditemukan' });
    }
    res.json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};

export const createRoom = async (req, res, next) => {
  try {
    const db = await getDB();
    const { room_number, type, price, facilities, status, image_url } = req.body;

    if (!room_number || !price) {
      return res.status(400).json({ success: false, error: 'Nomor kamar dan tarif sewa wajib diisi' });
    }

    // Check if room_number already exists
    const existing = await db.get('SELECT id FROM rooms WHERE room_number = ?', [room_number]);
    if (existing) {
      return res.status(400).json({ success: false, error: `Nomor kamar ${room_number} sudah terdaftar` });
    }

    // If file was uploaded via multer in same request or url provided
    let finalImageUrl = image_url || '/uploads/rooms/default-room.svg';
    if (req.file) {
      finalImageUrl = `/uploads/rooms/${req.file.filename}`;
    }

    const result = await db.run(
      `INSERT INTO rooms (room_number, type, price, facilities, status, image_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        room_number,
        type || 'Reguler',
        Number(price),
        facilities || 'Fasilitas Standar',
        status || 'Tersedia',
        finalImageUrl
      ]
    );

    const newRoom = await db.get('SELECT * FROM rooms WHERE id = ?', [result.lastID]);

    res.status(201).json({
      success: true,
      message: 'Kamar berhasil ditambahkan',
      data: newRoom
    });
  } catch (err) {
    next(err);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const db = await getDB();
    const { id } = req.params;
    const { room_number, type, price, facilities, status, image_url } = req.body;

    const currentRoom = await db.get('SELECT * FROM rooms WHERE id = ?', [id]);
    if (!currentRoom) {
      return res.status(404).json({ success: false, error: 'Kamar tidak ditemukan' });
    }

    let finalImageUrl = image_url || currentRoom.image_url;
    if (req.file) {
      finalImageUrl = `/uploads/rooms/${req.file.filename}`;
    }

    await db.run(
      `UPDATE rooms
       SET room_number = ?, type = ?, price = ?, facilities = ?, status = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        room_number || currentRoom.room_number,
        type || currentRoom.type,
        price ? Number(price) : currentRoom.price,
        facilities || currentRoom.facilities,
        status || currentRoom.status,
        finalImageUrl,
        id
      ]
    );

    const updated = await db.get('SELECT * FROM rooms WHERE id = ?', [id]);
    res.json({ success: true, message: 'Data kamar berhasil diperbarui', data: updated });
  } catch (err) {
    next(err);
  }
};

export const updateRoomStatus = async (req, res, next) => {
  try {
    const db = await getDB();
    const { id } = req.params;
    const { status } = req.body;

    if (!['Tersedia', 'Terisi', 'Renovasi'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status tidak valid (Tersedia, Terisi, Renovasi)' });
    }

    await db.run('UPDATE rooms SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
    res.json({ success: true, message: `Status kamar diperbarui menjadi ${status}` });
  } catch (err) {
    next(err);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    const db = await getDB();
    const { id } = req.params;

    const room = await db.get('SELECT * FROM rooms WHERE id = ?', [id]);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Kamar tidak ditemukan' });
    }

    await db.run('DELETE FROM rooms WHERE id = ?', [id]);
    res.json({ success: true, message: `Kamar ${room.room_number} berhasil dihapus` });
  } catch (err) {
    next(err);
  }
};
