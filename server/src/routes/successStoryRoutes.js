import { Router } from 'express';
import { protect, permit, maintenanceGuard } from '../middleware/auth.js';
import { submitSuccessStory, mySuccessStories } from '../controllers/successStoryController.js';

const router = Router();
router.post('/success-stories', protect, permit('member'), maintenanceGuard, submitSuccessStory);
router.get('/success-stories/mine', protect, permit('member'), maintenanceGuard, mySuccessStories);
export default router;
