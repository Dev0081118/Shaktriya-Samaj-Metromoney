import { Router } from 'express';
import { protect, permit, maintenanceGuard } from '../middleware/auth.js';
import { submitSuccessStory, mySuccessStories, inviteStoryPartner, myStoryConsentInvitations, respondStoryConsent, withdrawStoryConsent } from '../controllers/successStoryController.js';

const router = Router();
router.post('/success-stories', protect, permit('member'), maintenanceGuard, submitSuccessStory);
router.get('/success-stories/mine', protect, permit('member'), maintenanceGuard, mySuccessStories);
router.get('/success-stories/consent-invitations', protect, permit('member'), maintenanceGuard, myStoryConsentInvitations);
router.post('/success-stories/:id/invite', protect, permit('member'), maintenanceGuard, inviteStoryPartner);
router.post('/success-stories/:id/consent', protect, permit('member'), maintenanceGuard, respondStoryConsent);
router.patch('/success-stories/:id/withdraw', protect, permit('member'), maintenanceGuard, withdrawStoryConsent);
export default router;
