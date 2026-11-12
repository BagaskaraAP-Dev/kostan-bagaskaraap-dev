import express from 'express';
import {
  getComplaints,
  createComplaint,
  updateComplaintStatus,
  deleteComplaint
} from '../controllers/complaintController.js';
import { uploadComplaintPhoto } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getComplaints);
router.post('/', uploadComplaintPhoto, createComplaint);
router.put('/:id/status', updateComplaintStatus);
router.delete('/:id', deleteComplaint);

export default router;
