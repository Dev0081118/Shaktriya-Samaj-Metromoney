export const STAFF_ROLES = [
  'moderator',
  'admin',
  'super_admin'
];

export function getHomeRouteForRole(role) {
  if (['moderator', 'admin', 'super_admin', 'relationship_manager'].includes(role)) return '/admin';
  return '/dashboard';
}

export const isMemberRole = (role) => role === 'member';
