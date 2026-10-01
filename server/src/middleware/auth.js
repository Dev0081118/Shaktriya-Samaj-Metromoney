import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { getSystemSettings } from '../services/systemService.js';
export const protect = asyncHandler(async (req, _res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  if (!token) throw new ApiError(401, 'Authentication required.');
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Your session is invalid or expired.');
  }
  const user = await User.findById(payload.sub);
  if (!user || user.status !== 'Active')
    throw new ApiError(401, 'Account is not available.');
  req.user = user;
  next();
});
export const optionalProtect = asyncHandler(async (req, _res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET),
      user = await User.findById(payload.sub);
    if (user?.status === 'Active') req.user = user;
  } catch {
    /* Public request continues anonymously. */
  }
  next();
});
export const maintenanceGuard = asyncHandler(async (req, _res, next) => {
  if (['admin', 'moderator', 'super_admin'].includes(req.user.role))
    return next();
  if ((await getSystemSettings()).maintenanceMode)
    throw new ApiError(
      503,
      'The member portal is temporarily unavailable for maintenance.',
      [],
      'MAINTENANCE_MODE'
    );
  next();
});
export const permit =
  (...roles) =>
  (req, _res, next) =>
    roles.includes(req.user.role)
      ? next()
      : next(
          new ApiError(
            403,
            'You do not have permission to perform this action.'
          )
        );
