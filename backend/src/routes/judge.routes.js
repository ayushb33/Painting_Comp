import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as judge from '../controllers/judge.controller.js';

const router = Router();
router.use(authenticate, authorize('JUDGE'));

router.get('/schools', judge.getSchoolsForJudging);
router.get('/schools/:schoolId/paintings', judge.getPaintingsForSchool);
router.post('/scores', judge.submitScore);

export default router;