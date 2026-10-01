import User from '../models/User.js';
import { NotificationPreference } from '../models/Business.js';
import { sendEmailSafely } from './emailService.js';
const preferenceFor = {
  interest: 'emailInterests',
  match: 'emailMatches',
  payment: 'emailPayments'
};
export async function emailUser(
  userId,
  { category, subject, template, data = {}, security = false }
) {
  const user = await User.findById(userId).select('email');
  if (!user?.email) return false;
  if (!security && preferenceFor[category]) {
    const preferences = await NotificationPreference.findOne({
      user: userId
    }).lean();
    if (preferences?.[preferenceFor[category]] === false) return false;
  }
  sendEmailSafely({ to: user.email, subject, template, data });
  return true;
}
