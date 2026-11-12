import express from 'express';
import { handleImageUpload, listUploadedImages } from '../controllers/uploadController.js';
import { uploadSingleImage } from '../middleware/upload.js';

const router = express.Router();

router.post('/', uploadSingleImage, handleImageUpload);
router.get('/gallery', listUploadedImages);

export default router;
