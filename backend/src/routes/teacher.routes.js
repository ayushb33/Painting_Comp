import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../middleware/auth.js';
import * as teacher from '../controllers/teacher.controller.js';
import { uploadPainting } from '../config/cloudinary.js';

const router = Router();

// CSV upload uses memory storage with 2MB limit
const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }
});

router.use(authenticate, authorize('TEACHER'));

// Students
router.get('/students', teacher.getMyStudents);
router.post('/students', teacher.addStudent);
router.post('/students/bulk-upload', csvUpload.single('file'), teacher.bulkUploadStudents);
router.get('/students/csv-template', teacher.downloadCSVTemplate);
router.delete('/students/:studentId', teacher.deleteStudent);

// Attendance
router.post('/attendance', teacher.markAttendance);

// Paintings — uploadPainting multer middleware from cloudinary config
router.post('/paintings', uploadPainting.single('image'), teacher.uploadPainting);

// Profile
router.get('/profile', teacher.getProfile);
router.patch('/profile', teacher.updateProfile);

// Results
router.get('/results', teacher.getMyResults);

export default router;