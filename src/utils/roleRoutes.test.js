import { describe, expect, it } from 'vitest';
import { getHomeRouteForRole } from './roleRoutes';

describe('getHomeRouteForRole', () => {
  it.each([
    ['member', '/dashboard'],
    ['relationship_manager', '/manager'],
    ['moderator', '/admin'],
    ['admin', '/admin'],
    ['super_admin', '/admin']
  ])('routes %s to %s', (role, route) => {
    expect(getHomeRouteForRole(role)).toBe(route);
  });
});
