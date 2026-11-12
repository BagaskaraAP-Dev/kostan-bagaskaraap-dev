export function errorHandler(err, req, res, next) {
  console.error('Error occurred:', err.message || err);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Ukuran file terlalu besar! Maksimum 10MB.'
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Terjadi kesalahan internal pada server'
  });
}
