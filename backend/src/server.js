import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import fs from 'fs';

import { getDB } from './config/database.js';
import roomRoutes from './routes/rooms.js';
import bookingRoutes from './routes/bookings.js';
import complaintRoutes from './routes/complaints.js';
import dashboardRoutes from './routes/dashboard.js';
import uploadRoutes from './routes/upload.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const uploadDir = process.env.UPLOAD_DIR || path.resolve(__dirname, '../uploads');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files for user uploads
app.use('/uploads', express.static(uploadDir));

// Fallback for /img route so existing SVGs and links stay 100% compatible
const roomsUploadDir = path.join(uploadDir, 'rooms');
app.use('/img', express.static(roomsUploadDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Kostan BagaskaraAP-Dev API',
    version: '2.0.0'
  });
});

// API Routes
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);

// Serve frontend if built (single-container production deployment)
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);

// Start Server
async function startServer() {
  try {
    await getDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Kostan BagaskaraAP-Dev API v2.0 listening on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('Failed to initialize server:', err);
    process.exit(1);
  }
}

startServer();
