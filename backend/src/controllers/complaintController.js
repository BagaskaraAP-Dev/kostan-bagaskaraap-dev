import { getDB } from '../config/database.js';

export const getComplaints = async (req, res, next) => {
  try {
    const db = await getDB();
    const { status, category, search } = req.query;

    let query = 'SELECT * FROM complaints WHERE 1=1';
    const params = [];

    if (status && status !== 'Semua') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (category && category !== 'Semua') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (search && search.trim() !== '') {
      query += ' AND (tenant_name LIKE ? OR room_number LIKE ? OR description LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += ' ORDER BY id DESC';
    const complaints = await db.all(query, params);

    res.json({ success: true, count: complaints.length, data: complaints });
  } catch (err) {
    next(err);
  }
};

export const createComplaint = async (req, res, next) => {
  try {
    const db = await getDB();
    const { tenant_name, room_number, category, description, photo_url } = req.body;

    if (!tenant_name || !room_number || !description) {
      return res.status(400).json({
        success: false,
        error: 'Mohon isi nama penghuni, nomor kamar, dan deskripsi kendala'
      });
    }

    let finalPhotoUrl = photo_url || null;
    if (req.file) {
      finalPhotoUrl = `/uploads/complaints/${req.file.filename}`;
    }

    const result = await db.run(
      `INSERT INTO complaints (tenant_name, room_number, category, description, photo_url, status)
       VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [tenant_name, room_number, category || 'Fasilitas Kamar', description, finalPhotoUrl]
    );

    const newComplaint = await db.get('SELECT * FROM complaints WHERE id = ?', [result.lastID]);

    res.status(201).json({
      success: true,
      message: 'Laporan kendala fasilitas berhasil dikirim dan akan segera ditindaklanjuti',
      data: newComplaint
    });
  } catch (err) {
    next(err);
  }
};

export const updateComplaintStatus = async (req, res, next) => {
  try {
    const db = await getDB();
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Diproses', 'Selesai'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Status laporan tidak valid' });
    }

    await db.run('UPDATE complaints SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: `Status laporan diubah menjadi: ${status}` });
  } catch (err) {
    next(err);
  }
};

export const deleteComplaint = async (req, res, next) => {
  try {
    const db = await getDB();
    const { id } = req.params;

    await db.run('DELETE FROM complaints WHERE id = ?', [id]);
    res.json({ success: true, message: 'Laporan pengaduan berhasil dihapus' });
  } catch (err) {
    next(err);
  }
};
