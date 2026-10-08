import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

export interface AppNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'verified' | 'rejected' | 'updated' | 'resolved' | 'match' | 'accepted' | 'milestone_approved' | 'milestone_rejected' | 'milestone_submitted' | 'completed' | 'high_priority' | 'pending';
  targetUrl?: string;
}

// Seed notifications tailored by role
const CITIZEN_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'c-1',
    title: 'Problem Report Verified',
    message: 'Your report "Water Quality & Turbidity Monitoring in Ward 12" has been verified by Municipal Officers.',
    time: '15m ago',
    read: false,
    type: 'verified',
    targetUrl: '/citizen/problem/prob-seed-1'
  },
  {
    id: 'c-2',
    title: 'Research Team Field Testing',
    message: 'ABC Institute of Technology initiated field testing telemetry in Ward 12.',
    time: '2h ago',
    read: false,
    type: 'updated',
    targetUrl: '/citizen/problem/prob-seed-1'
  },
  {
    id: 'c-3',
    title: 'Community Report Resolved',
    message: 'Pothole Repair on Main Road Subhash Chowk has been marked RESOLVED.',
    time: '1d ago',
    read: true,
    type: 'resolved',
    targetUrl: '/citizen'
  }
];

const INSTITUTE_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'i-1',
    title: 'New AI Challenge Match',
    message: '94% Match found: Water Quality Monitoring System in Ward 12.',
    time: '10m ago',
    read: false,
    type: 'match',
    targetUrl: '/institute/challenges'
  },
  {
    id: 'i-2',
    title: 'Milestone Phase 3 Approved',
    message: 'Government Officer approved "IoT Sensor Hardware Prototype" deliverable.',
    time: '3h ago',
    read: false,
    type: 'milestone_approved',
    targetUrl: '/institute/project/JS-2026-001'
  },
  {
    id: 'i-3',
    title: 'Challenge Acceptance Confirmed',
    message: 'Project #JS-2026-001 successfully initialized in Planning status.',
    time: '1d ago',
    read: true,
    type: 'accepted',
    targetUrl: '/institute/project/JS-2026-001'
  }
];

const GOVERNMENT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'g-1',
    title: 'New High-Priority Civic Report',
    message: 'Critical Waste Accumulation reported at Subhash Chowk commercial market.',
    time: '5m ago',
    read: false,
    type: 'high_priority',
    targetUrl: '/admin/queue'
  },
  {
    id: 'g-2',
    title: 'Milestone Submitted for Review',
    message: 'ABC Institute submitted Phase 4 Field Testing evidence for project #JS-2026-001.',
    time: '1h ago',
    read: false,
    type: 'milestone_submitted',
    targetUrl: '/admin/projects'
  },
  {
    id: 'g-3',
    title: 'Pending Verification Queue (3)',
    message: '3 community reports are awaiting municipal officer verification.',
    time: '4h ago',
    read: true,
    type: 'pending',
    targetUrl: '/admin/verification'
  }
];

export const notificationService = {
  /**
   * Fetch in-app notifications from Supabase or seed fallback
   */
  async getNotifications(userId?: string, role: UserRole = 'CITIZEN'): Promise<AppNotification[]> {
    try {
      const normRole = (role || 'CITIZEN').toString().toLowerCase();

      if (userId) {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          return data.map(n => ({
            id: n.id,
            userId: n.user_id,
            title: n.title,
            message: n.message,
            time: 'Just now',
            read: n.read || false,
            type: 'updated'
          }));
        }
      }

      // Return role-tailored seed notifications
      if (normRole === 'admin') return GOVERNMENT_NOTIFICATIONS;
      if (normRole === 'institute') return INSTITUTE_NOTIFICATIONS;
      return CITIZEN_NOTIFICATIONS;

    } catch (err) {
      console.warn('Fallback notifications execution:', err);
      const normRole = (role || 'CITIZEN').toString().toLowerCase();
      if (normRole === 'admin') return GOVERNMENT_NOTIFICATIONS;
      if (normRole === 'institute') return INSTITUTE_NOTIFICATIONS;
      return CITIZEN_NOTIFICATIONS;
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
    } catch (err) {
      console.warn('Mark as read fallback:', err);
    }
  }
};
