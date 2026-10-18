import User from '../models/User.js';
import { Notification } from '../models/Platform.js';
import { publishUserEvent } from '../realtime/socketServer.js';
import { emailUser } from './notificationEmailService.js';

// Notification dispatch is intentionally best-effort: email outages must never
// roll back consent, moderation, withdrawal, or story submission.
export async function dispatchStoryEvent({ userIds = [], type, title, message, storyId, url }) {
  const recipients = [...new Set(userIds.filter(Boolean).map(String))];
  for (const userId of recipients) {
    try {
      const created = await Notification.create({ user: userId, type, title, message, relatedRecord: storyId });
      publishUserEvent(userId, 'notification:new', { id: String(created._id) });
    } catch (error) {
      console.error('Story notification persistence failed:', error.message);
    }
    try {
      await emailUser(userId, {
        category: 'story', subject: title, template: 'system-event',
        data: { Message: message, Action: url || '/story-consent' }
      });
    } catch (error) {
      console.error('Story email dispatch failed:', error.message);
    }
  }
}

export async function storyAdminIds() {
  const admins = await User.find({ role: { $in: ['admin', 'super_admin'] }, status: 'Active' })
    .select('_id').lean();
  return admins.map((user) => user._id);
}
