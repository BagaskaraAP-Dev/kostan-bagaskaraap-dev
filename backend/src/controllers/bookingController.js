import { getDB } from '../config/database.js';

export const getBookings = async (req, res, next) => {
  try {
    const db = await getDB();
    const { status, search } = req.query;

    let query = `
      SELECT b.*, r.room_number, r.type as room_type, r.price as room_price, r.image_url as room_image
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'Semua') {
      query += ' AND b.payment_status = ?';
      params.push(status);
    }

    if (search && search.trim() !== '') {
      query += ' AND (b.tenant_name LIKE ? OR b.tenant_phone LIKE ? OR r.room_number LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += ' ORDER BY b.id DESC';
    const bookings = await db.all(query, params);

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    next(err);
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const db = await getDB();
    const { room_id, tenant_name, tenant_phone, check_in_date, duration_months, notes } = req.body;

    if (!room_id || !tenant_name || !tenant_phone || !check_in_date) {
      return res.status(400).json({
        success: false,
        error: 'Mohon lengkapi semua formulir reservasi (Kamar, Nama, No. HP, Tanggal Check-in)'
      });
    }

    const room = await db.get('SELECT * FROM rooms WHERE id = ?', [room_id]);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Kamar tidak ditemukan' });
    }
    if (room.status === 'Terisi') {
      return res.status(400).json({ success: false, error: 'Maaf, kamar ini baru saja terisi oleh penyewa lain.' });
    }

    const duration = Math.max(1, Number(duration_months) || 1);
    const totalPrice = room.price * duration;

    // Check if image/payment proof was attached
    let paymentProof = null;
    if (req.file) {
      paymentProof = `/uploads/bookings/${req.file.filename}`;
    } else if (req.body.payment_proof) {
      paymentProof = req.body.payment_proof;
    }

    const result = await db.run(
      `INSERT INTO bookings (room_id, tenant_name, tenant_phone, check_in_date, duration_months, total_price, payment_status, payment_proof, notes)
       VALUES (?, ?, ?, ?, ?, ?, 'Menunggu Pembayaran', ?, ?)`,
      [room_id, tenant_name, tenant_phone, check_in_date, duration, totalPrice, paymentProof, notes || null]
    );

    // Update room status to 'Terisi'
    await db.run('UPDATE rooms SET status = ? WHERE id = ?', ['Terisi', room_id]);

    const createdBooking = await db.get('SELECT * FROM bookings WHERE id = ?', [result.lastID]);

    res.status(201).json({
      success: true,
      message: 'Reservasi berhasil dikirim! Silakan tunggu konfirmasi pengelola.',
      bookingId: result.lastID,
      data: createdBooking,
      totalPrice
    });
  } catch (err) {
    next(err);
  }
};

export const updatePaymentStatus = async (req, res, next) => {
  try {
    const db = await getDB();
    const { id } = req.params;
    const { payment_status } = req.body;

    const validStatuses = ['Menunggu Pembayaran', 'Lunas', 'Ditolak', 'Dibatalkan'];
    if (!validStatuses.includes(payment_status)) {
      return res.status(400).json({ success: false, error: 'Status pembayaran tidak valid' });
    }

    const booking = await db.get('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Reservasi tidak ditemukan' });
    }

    await db.run('UPDATE bookings SET payment_status = ? WHERE id = ?', [payment_status, id]);

    // If cancelled or rejected, release room back to 'Tersedia'
    if (payment_status === 'Ditolak' || payment_status === 'Dibatalkan') {
      await db.run('UPDATE rooms SET status = ? WHERE id = ?', ['Tersedia', booking.room_id]);
    } else if (payment_status === 'Lunas') {
      await db.run('UPDATE rooms SET status = ? WHERE id = ?', ['Terisi', booking.room_id]);
    }

    res.json({ success: true, message: `Status pembayaran diperbarui menjadi: ${payment_status}` });
  } catch (err) {
    next(err);
  }
};

export const deleteBooking = async (req, res, next) => {
  try {
    const db = await getDB();
    const { id } = req.params;

    const booking = await db.get('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Reservasi tidak ditemukan' });
    }

    await db.run('DELETE FROM bookings WHERE id = ?', [id]);
    res.json({ success: true, message: 'Data reservasi berhasil dihapus' });
  } catch (err) {
    next(err);
  }
};
