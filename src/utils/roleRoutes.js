export const STAFF_ROLES = [
  'relationship_manager',
  'moderator',
  'admin',
  'super_admin'
];

export function getHomeRouteForRole(role) {
  if (role === 'relationship_manager') return '/manager';
  if (['moderator', 'admin', 'super_admin'].includes(role)) return '/admin';
  return '/dashboard';
}

export const isMemberRole = (role) => role === 'member';
