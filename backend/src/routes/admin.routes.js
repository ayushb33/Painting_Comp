import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../middleware/auth.js';
import * as admin from '../controllers/admin.controller.js';

const router = Router();
router.use(authenticate, authorize('ADMIN'));

// Dashboard
router.get('/dashboard', admin.getDashboardStats);

// Schools
router.post('/schools', admin.createSchool);
router.get('/schools', admin.listSchools);
router.get('/schools/:schoolId/students', admin.getSchoolStudents);
router.get('/schools/export', admin.exportSchoolsCSV);

// Painting approval
router.get('/paintings/school/:schoolId', admin.getPaintingsBySchool);
router.patch('/paintings/:paintingId/approve', admin.approvePainting);
router.patch('/paintings/:paintingId/undo-approve', admin.undoApprovePainting);
router.patch('/paintings/school/:schoolId/bulk-approve', admin.bulkApprovePaintings);

// Verification
router.get('/verification', admin.getVerificationData);

// Results
router.post('/results/school/:schoolId/publish', admin.publishResults);
router.patch('/results/school/:schoolId/unpublish', admin.undoPublishResults);

// Leaderboard
router.get('/leaderboard', admin.getLeaderboard);

// Judges
router.post('/judges', admin.createJudge);

export default router;