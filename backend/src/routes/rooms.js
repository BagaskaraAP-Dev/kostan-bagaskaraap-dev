import express from 'express';
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  updateRoomStatus,
  deleteRoom
} from '../controllers/roomController.js';
import { uploadSingleImage } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getRooms);
router.get('/:id', getRoomById);
router.post('/', uploadSingleImage, createRoom);
router.put('/:id', uploadSingleImage, updateRoom);
router.put('/:id/status', updateRoomStatus);
router.delete('/:id', deleteRoom);

export default router;
