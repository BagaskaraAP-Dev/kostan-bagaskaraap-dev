import { getDB } from '../config/database.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const db = await getDB();

    const totalRooms = await db.get('SELECT COUNT(*) as count FROM rooms');
    const occupiedRooms = await db.get("SELECT COUNT(*) as count FROM rooms WHERE status = 'Terisi'");
    const availableRooms = await db.get("SELECT COUNT(*) as count FROM rooms WHERE status = 'Tersedia'");
    const maintenanceRooms = await db.get("SELECT COUNT(*) as count FROM rooms WHERE status = 'Renovasi'");

    const totalRevenue = await db.get("SELECT SUM(total_price) as total FROM bookings WHERE payment_status = 'Lunas'");
    const pendingRevenue = await db.get("SELECT SUM(total_price) as total, COUNT(*) as count FROM bookings WHERE payment_status = 'Menunggu Pembayaran'");

    const activeComplaints = await db.get("SELECT COUNT(*) as count FROM complaints WHERE status != 'Selesai'");
    const pendingComplaints = await db.get("SELECT COUNT(*) as count FROM complaints WHERE status = 'Pending'");

    const recentBookings = await db.all(`
      SELECT b.*, r.room_number, r.type as room_type
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      ORDER BY b.id DESC
      LIMIT 5
    `);

    const recentComplaints = await db.all(`
      SELECT * FROM complaints
      ORDER BY id DESC
      LIMIT 5
    `);

    const totalRoomsCount = totalRooms.count || 0;
    const occupiedCount = occupiedRooms.count || 0;
    const occupancyRate = totalRoomsCount > 0 ? Math.round((occupiedCount / totalRoomsCount) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalRooms: totalRoomsCount,
        occupiedRooms: occupiedCount,
        availableRooms: availableRooms.count || 0,
        maintenanceRooms: maintenanceRooms.count || 0,
        occupancyRate,
        totalRevenue: totalRevenue.total || 0,
        pendingRevenue: pendingRevenue.total || 0,
        pendingBookingsCount: pendingRevenue.count || 0,
        activeComplaints: activeComplaints.count || 0,
        pendingComplaints: pendingComplaints.count || 0,
        recentBookings,
        recentComplaints
      }
    });
  } catch (err) {
    next(err);
  }
};
