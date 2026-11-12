import express from 'express';
import {
  getBookings,
  createBooking,
  updatePaymentStatus,
  deleteBooking
} from '../controllers/bookingController.js';
import { uploadReceipt } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getBookings);
router.post('/', uploadReceipt, createBooking);
router.put('/:id/payment', updatePaymentStatus);
router.delete('/:id', deleteBooking);

export default router;
