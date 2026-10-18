import { Router } from 'express';
import mongoose from 'mongoose';
import { protect, permit } from '../middleware/auth.js';
import { Notification } from '../models/Platform.js';
import { asyncHandler, ok, ApiError } from '../utils/http.js';
import { publishUserEvent } from '../realtime/socketServer.js';

const router = Router();
router.get('/admin/notifications', protect, permit('admin', 'super_admin'), asyncHandler(async (req, res) => {
  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ user: req.user.id }).sort('-createdAt').limit(60).lean(),
    Notification.countDocuments({ user: req.user.id, read: false })
  ]);
  ok(res, { notifications, unreadCount });
}));
router.patch('/admin/notifications/:id/read', protect, permit('admin', 'super_admin'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (id !== 'all' && !mongoose.isValidObjectId(id)) throw new ApiError(400, 'Invalid notification ID.');
  await Notification.updateMany(id === 'all' ? { user: req.user.id, read: false } : { _id: id, user: req.user.id }, { $set: { read: true } });
  publishUserEvent(req.user.id, 'notification:read');
  ok(res, {}, 'Notification marked read.');
}));
export default router;
