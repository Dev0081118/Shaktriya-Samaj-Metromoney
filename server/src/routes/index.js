import { Router } from 'express';
import * as auth from '../controllers/authController.js';
import * as profile from '../controllers/profileController.js';
import * as interact from '../controllers/interactionController.js';
import * as admin from '../controllers/adminController.js';
import * as business from '../controllers/businessController.js';
import { dashboard } from '../controllers/dashboardController.js';
import {
  protect,
  optionalProtect,
  permit,
  maintenanceGuard
} from '../middleware/auth.js';
import { imageUpload } from '../middleware/upload.js';
import { requireAdvancedSearch } from '../middleware/entitlements.js';
import {
  createOrder,
  verify,
  publicPlans,
  entitlements,
  subscriptionMe
} from '../controllers/membershipController.js';

const router = Router();
const member = [protect, maintenanceGuard];
const staff = permit('admin', 'moderator', 'super_admin');
const adminOnly = permit('admin', 'super_admin');
const superAdmin = permit('super_admin');

router.get('/public/plans', publicPlans);
router.get('/public/system-status', business.publicSystemStatus);
router.post('/support', optionalProtect, business.createSupport);
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.post('/auth/send-otp', auth.requestOtp);
router.post('/auth/forgot-password', business.forgotPassword);
router.post('/auth/reset-password', business.resetPassword);
router.post('/auth/verify-otp', ...member, auth.confirmOtp);
router.get('/auth/me', protect, auth.me);
router.patch('/auth/change-password', ...member, auth.changePassword);
router.post('/auth/logout', protect, (_q, res) =>
  res.json({ success: true, message: 'Signed out.', data: {} })
);
router.delete('/auth/account', ...member, business.deleteAccount);

router.get('/dashboard', ...member, dashboard);
router.post('/profiles', ...member, profile.upsert);
router.patch('/profiles/me', ...member, profile.upsert);
router.get('/profiles/me', ...member, profile.mine);
router.patch('/profiles/privacy', ...member, profile.updatePrivacy);
router.patch('/profiles/pause', ...member, profile.setPause);
router.patch('/profiles/lifecycle', ...member, business.setLifecycle);
router.post(
  '/profiles/photo',
  ...member,
  imageUpload.single('photo'),
  profile.savePhoto
);
router.post(
  '/profiles/gallery',
  ...member,
  imageUpload.single('photo'),
  profile.addGalleryPhoto
);
router.delete(
  '/profiles/gallery/:assetId',
  ...member,
  profile.removeGalleryPhoto
);
router.get(
  '/profiles/discover',
  ...member,
  requireAdvancedSearch,
  profile.discover
);
router.get('/profiles/:profileId', ...member, profile.getOne);
router.get('/preferences', ...member, profile.getPreferences);
router.put('/preferences', ...member, profile.savePreferences);

router.post('/interests', ...member, interact.createInterest);
router.get('/interests/:side', ...member, interact.listInterests);
router.patch('/interests/:id/:action', ...member, interact.updateInterest);
router.get('/matches', ...member, interact.listMatches);
router.post('/shortlist', ...member, interact.shortlist);
router.get('/shortlist', ...member, interact.listShortlist);
router.delete('/shortlist/:profileId', ...member, interact.removeShortlist);
router.get('/notifications', ...member, interact.notifications);
router.patch('/notifications/:id/read', ...member, interact.readNotification);
router.get(
  '/notification-preferences',
  ...member,
  business.getNotificationPreferences
);
router.put(
  '/notification-preferences',
  ...member,
  business.saveNotificationPreferences
);
router.post('/reports', ...member, interact.report);
router.post('/blocks', ...member, interact.block);
router.get('/blocks', ...member, profile.getBlocks);
router.delete('/blocks/:profileId', ...member, profile.removeBlock);

router.post('/contact-requests', ...member, business.createContactRequest);
router.get('/contact-requests/:side', ...member, business.listContactRequests);
router.patch(
  '/contact-requests/:id/:action',
  ...member,
  business.updateContactRequest
);
router.post('/contact-requests/:id/unlock', ...member, business.unlockContact);
router.get('/plans', ...member, publicPlans);
router.get('/entitlements', ...member, entitlements);
router.get('/subscription/me', ...member, subscriptionMe);
router.post('/payments/orders', ...member, createOrder);
router.post('/payments/verify', ...member, verify);
router.get('/profile-boost', ...member, business.boostStatus);
router.post('/profile-boost', ...member, business.activateBoost);
router.get('/relationship-manager', ...member, business.myManager);

router.get('/admin/overview', protect, staff, admin.overview);
router.get('/admin/profiles', protect, staff, admin.profiles);
router.get('/admin/profiles/:id', protect, staff, admin.profile);
router.patch('/admin/profiles/:id/:action', protect, staff, admin.moderate);
router.get('/admin/users', protect, adminOnly, admin.users);
router.patch('/admin/users/:id', protect, adminOnly, admin.updateUser);
router.get('/admin/reports', protect, staff, admin.reports);
router.patch('/admin/reports/:id', protect, staff, admin.updateReport);
router.get('/admin/subscriptions', protect, adminOnly, admin.subscriptions);
router.get('/admin/support', protect, adminOnly, business.support);
router.patch('/admin/support/:id', protect, adminOnly, business.updateSupport);
router.get('/admin/payments', protect, superAdmin, business.payments);
router.get('/admin/plans', protect, superAdmin, business.allPlans);
router.post('/admin/plans', protect, superAdmin, business.managePlans);
router.patch('/admin/plans/:id', protect, superAdmin, business.managePlans);
router.get('/admin/settings', protect, superAdmin, business.settings);
router.patch('/admin/settings', protect, superAdmin, business.saveSettings);
router.get('/admin/audit-logs', protect, superAdmin, business.auditLogs);
router.get(
  '/admin/relationship-managers',
  protect,
  adminOnly,
  business.managers
);
router.put(
  '/admin/relationship-managers/assignment',
  protect,
  adminOnly,
  business.assignManager
);

export default router;
