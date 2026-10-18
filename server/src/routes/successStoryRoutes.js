import { Router } from 'express';
import { protect, permit, maintenanceGuard } from '../middleware/auth.js';
import { adminListSuccessStories, adminModerateSuccessStory, publicApprovedSuccessStories, submitSuccessStory, mySuccessStories, inviteStoryPartner, myStoryConsentInvitations, respondStoryConsent, withdrawStoryConsent, reviseSuccessStory } from '../controllers/successStoryController.js';

const router = Router();
router.get('/public/success-stories', publicApprovedSuccessStories);
router.get('/admin/success-stories', protect, permit('admin', 'super_admin'), adminListSuccessStories);
router.patch('/admin/success-stories/:id', protect, permit('admin', 'super_admin'), adminModerateSuccessStory);
router.post('/success-stories', protect, permit('member'), maintenanceGuard, submitSuccessStory);
router.get('/success-stories/mine', protect, permit('member'), maintenanceGuard, mySuccessStories);
router.get('/success-stories/consent-invitations', protect, permit('member'), maintenanceGuard, myStoryConsentInvitations);
router.patch('/success-stories/:id/revise', protect, permit('member'), maintenanceGuard, reviseSuccessStory);
router.post('/success-stories/:id/invite', protect, permit('member'), maintenanceGuard, inviteStoryPartner);
router.post('/success-stories/:id/consent', protect, permit('member'), maintenanceGuard, respondStoryConsent);
router.patch('/success-stories/:id/withdraw', protect, permit('member'), maintenanceGuard, withdrawStoryConsent);
export default router;
