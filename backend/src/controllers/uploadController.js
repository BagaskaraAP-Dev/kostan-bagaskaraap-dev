import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseUploadDir = process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads');

export const handleImageUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Silakan pilih file gambar untuk diunggah' });
  }

  // Calculate relative public path
  const relativeSubdir = path.relative(baseUploadDir, req.file.destination).replace(/\\/g, '/');
  const imageUrl = `/uploads/${relativeSubdir}/${req.file.filename}`;

  res.status(201).json({
    success: true,
    message: 'Gambar berhasil diunggah',
    data: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: imageUrl
    }
  });
};

export const listUploadedImages = (req, res) => {
  try {
    const category = req.query.category || 'all';
    const subfolders = category === 'all' ? ['rooms', 'complaints', 'bookings', 'general'] : [category];

    const results = [];

    subfolders.forEach((folder) => {
      const folderPath = path.join(baseUploadDir, folder);
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);
        files.forEach((file) => {
          const filePath = path.join(folderPath, file);
          const stat = fs.statSync(filePath);
          if (stat.isFile()) {
            results.push({
              name: file,
              category: folder,
              url: `/uploads/${folder}/${file}`,
              size: stat.size,
              createdAt: stat.birthtime
            });
          }
        });
      }
    });

    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
