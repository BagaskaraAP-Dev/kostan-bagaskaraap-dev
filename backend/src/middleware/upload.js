import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUploadDir = process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads');

// Ensure destination directories exist
const subfolders = ['rooms', 'complaints', 'bookings', 'general'];
subfolders.forEach((sub) => {
  const dir = path.join(baseUploadDir, sub);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let sub = 'general';
    if (req.baseUrl.includes('rooms') || req.body.category === 'room') {
      sub = 'rooms';
    } else if (req.baseUrl.includes('complaints') || req.body.category === 'complaint') {
      sub = 'complaints';
    } else if (req.baseUrl.includes('bookings') || req.body.category === 'booking') {
      sub = 'bookings';
    } else if (req.query.type && subfolders.includes(req.query.type)) {
      sub = req.query.type;
    }
    const targetDir = path.join(baseUploadDir, sub);
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .substring(0, 30);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif|svg\+xml|svg/;
  const mimeValid = allowedTypes.test(file.mimetype);
  const extValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeValid || extValid) {
    cb(null, true);
  } else {
    cb(new Error('Hanya format file gambar (JPEG, PNG, WEBP, GIF, SVG) yang diperbolehkan!'));
  }
};

export const uploadSingleImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).single('image');

export const uploadReceipt = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
}).single('payment_proof');

export const uploadComplaintPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
}).single('photo');
