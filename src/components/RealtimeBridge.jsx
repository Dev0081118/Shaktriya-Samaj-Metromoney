import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '');

function notificationPath(notification) {
  switch (notification?.type) {
    case 'NEW_INTEREST': return '/interests';
    case 'INTEREST_ACCEPTED': return '/interests';
    case 'INTEREST_DECLINED': return '/interests';
    case 'NEW_MATCH': return '/matches';
    case 'STORY_INVITATION':
    case 'STORY_CONSENT_DECLINED':
    case 'STORY_CONSENT_ACCEPTED':
    case 'STORY_APPROVED':
    case 'STORY_REJECTED':
    case 'STORY_CHANGES_REQUESTED':
    case 'STORY_WITHDRAWN': return '/story-consent';
    case 'STORY_SUBMITTED': return '/admin/success-stories';
    case 'PROFILE_APPROVED':
    case 'PROFILE_REJECTED': return '/my-profile';
    default: return '/notifications';
  }
}

function broadcastChange(type, payload = {}) {
  window.dispatchEvent(new CustomEvent('ksm:realtime', { detail: { type, ...payload } }));
}

export default function RealtimeBridge() {
  const { user, loading } = useAuth();
  const notify = useToast();

  useEffect(() => {
    if (loading || !user?._id) return undefined;
    let active = true;
    let seeded = false;
    const seen = new Set();
    const remember = (item) => {
      if (!item?._id || seen.has(String(item._id))) return false;
      seen.add(String(item._id));
      if (seen.size > 200) seen.delete(seen.values().next().value);
      return true;
    };
    const syncNotifications = async (showNew = false) => {
      try {
        const result = await api('/notifications');
        if (!active) return;
        const notifications = result.data?.notifications || [];
        for (const item of notifications) {
          const fresh = remember(item);
          if (fresh && seeded && showNew && !item.read) {
            notify(item.title || item.message || 'New notification', 'success', { path: notificationPath(item) });
          }
        }
        seeded = true;
        broadcastChange('notifications:sync', { unreadCount: result.data?.unreadCount || 0, notifications });
      } catch {
        // Offline or a revoked session: auth layer handles authentication failures.
      }
    };

    const socket = io(SERVER_URL, {
      path: '/socket.io',
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      autoConnect: true
    });
    socket.on('connect', () => { broadcastChange('connected'); void syncNotifications(true); });
    socket.on('realtime:ready', () => { broadcastChange('ready'); });
    socket.on('notification:new', () => { void syncNotifications(true); });
    socket.on('notification:read', () => { void syncNotifications(false); });
    for (const eventName of ['profile:status', 'interest:updated', 'match:updated']) {
      socket.on(eventName, () => {
        broadcastChange(eventName);
        void syncNotifications(true);
      });
    }
    const onVisibility = () => { if (document.visibilityState === 'visible') void syncNotifications(true); };
    document.addEventListener('visibilitychange', onVisibility);
    void syncNotifications(false);
    return () => {
      active = false;
      document.removeEventListener('visibilitychange', onVisibility);
      socket.disconnect();
    };
  }, [loading, user?._id, notify]);
  return null;
}
