import {
  BadgeIndianRupee,
  Bell,
  Bookmark,
  BriefcaseBusiness,
  CircleGauge,
  ClipboardCheck,
  Compass,
  CreditCard,
  Crown,
  FileWarning,
  HeartHandshake,
  Headphones,
  LayoutDashboard,
  ListChecks,
  ScrollText,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserCog,
  UserRound,
  UsersRound,
  Zap
} from 'lucide-react';

export const memberNavigation = [
  { to: '/story-consent', labelKey: 'nav.storyConsentCentre', icon: ShieldCheck },
  {
    to:
      '/dashboard',

    labelKey:
      'nav.dashboard',

    icon:
      LayoutDashboard
  },

  {
    to:
      '/discover',

    labelKey:
      'nav.discover',

    icon:
      Compass
  },

  {
    to:
      '/interests',

    labelKey:
      'nav.interests',

    badge: 'interests',

    icon:
      HeartHandshake
  },

  {
    to:
      '/matches',

    labelKey:
      'nav.matches',

    badge: 'matches',

    icon:
      UsersRound
  },

  {
    to:
      '/shortlisted',

    labelKey:
      'nav.shortlisted',

    icon:
      Bookmark
  },

  {
    to:
      '/notifications',

    labelKey:
      'nav.notifications',

    icon:
      Bell,

    badge:
      'notifications'
  },

  {
    to:
      '/my-profile',

    labelKey:
      'nav.myProfile',

    icon:
      UserRound
  },

  {
    to:
      '/membership',

    labelKey:
      'nav.membership',

    icon:
      Crown
  },

  {
    to:
      '/boosts',

    /*
     * Existing EN/GU/HIN translation key,
     * therefore no locale JSON change is needed.
     */
    labelKey:
      'membership.features.profileBoost',

    icon:
      Zap
  },

  {
    to:
      '/benefits',

    labelKey:
      'nav.benefits',

    icon:
      ShieldCheck
  },

  {
    to:
      '/settings',

    labelKey:
      'nav.settings',

    icon:
      Settings
  }
];

export const managerNavigation = [
  {
    groupKey:
      'manager.operations',

    links: [
      {
        to:
          '/manager',

        labelKey:
          'manager.assignedTitle',

        icon:
          BriefcaseBusiness,

        end:
          true
      }
    ]
  }
];

export const adminNavigation = [
  
  {
    groupKey:
      'admin.overview',

    links: [
      {
        to:
          '/admin',

        labelKey:
          'admin.overview',

        roles: [
          'moderator',
          'admin',
          'super_admin'
        ],

        icon:
          CircleGauge,

        end:
          true
      }
    ]
  },

  {
    groupKey:
      'admin.groups.customers',

    links: [
      {
        to:
          '/admin/customers',

        labelKey:
          'admin.customers',

        roles: [
          'admin',
          'super_admin'
        ],

        icon:
          UsersRound
      },

      {
        to:
          '/admin/profiles',

        labelKey:
          'admin.profiles',

        roles: [
          'moderator',
          'admin',
          'super_admin'
        ],

        icon:
          UserRound
      }
    ]
  },

  {
    groupKey:
      'admin.groups.matrimonial',
    
    links: [
      {
      to: '/admin/success-stories',
      labelKey: 'nav.storyApprovals',
      roles: ['admin', 'super_admin'],
      icon: ClipboardCheck
    },

      {
        to:
          '/admin/profiles',

        labelKey:
          'admin.moderation',

        roles: [
          'moderator',
          'admin',
          'super_admin'
        ],

        icon:
          ClipboardCheck
      },

      {
        to:
          '/admin/reports',

        labelKey:
          'admin.reports',

        roles: [
          'moderator',
          'admin',
          'super_admin'
        ],

        icon:
          FileWarning
      }
    ]
  },

  {
    groupKey:
      'admin.groups.customerOps',

    links: [
      {
        to:
          '/admin/support',

        labelKey:
          'admin.support',

        roles: [
          'admin',
          'super_admin'
        ],

        icon:
          Headphones
      },

      {
        to:
          '/admin/relationship-managers',

        labelKey:
          'admin.relationshipManagers',

        roles: [
          'admin',
          'super_admin'
        ],

        icon:
          HeartHandshake
      }
    ]
  },

  {
    groupKey:
      'admin.groups.business',

    links: [
      {
        to:
          '/admin/revenue',

        labelKey:
          'admin.revenue',

        roles: [
          'super_admin'
        ],

        icon:
          BadgeIndianRupee
      },

      {
        to:
          '/admin/payments',

        labelKey:
          'admin.payments',

        roles: [
          'admin',
          'super_admin'
        ],

        icon:
          CreditCard
      },

      {
        to:
          '/admin/subscriptions',

        labelKey:
          'admin.subscriptions',

        roles: [
          'admin',
          'super_admin'
        ],

        icon:
          ListChecks
      },

      {
        to:
          '/admin/plans',

        labelKey:
          'admin.plans',

        roles: [
          'super_admin'
        ],

        icon:
          Crown
      },

      {
        to:
          '/admin/boosts',

        labelKey:
          'membership.features.profileBoost',

        roles: [
          'super_admin'
        ],

        icon:
          Zap
      }
    ]
  },

  {
    groupKey:
      'admin.groups.platform',

    links: [
      {
        to:
          '/admin/users',

        labelKey:
          'admin.staffRoles',

        roles: [
          'super_admin'
        ],

        icon:
          UserCog
      },

      {
        to:
          '/admin/settings',

        labelKey:
          'admin.systemSettings',

        roles: [
          'super_admin'
        ],

        icon:
          Settings
      },

      {
        to:
          '/admin/system-health',

        labelKey:
          'admin.systemHealth',

        roles: [
          'super_admin'
        ],

        icon:
          Stethoscope
      },

      {
        to:
          '/admin/audit-logs',

        labelKey:
          'admin.auditLogs',

        roles: [
          'super_admin'
        ],

        icon:
          ScrollText
      }
    ]
  }
];

export function getNavigationForRole(
  role
) {
  if (
    role ===
    'member'
  ) {
    return [
      {
        links:
          memberNavigation
      }
    ];
  }

  if (
    role ===
    'relationship_manager'
  ) {
    return managerNavigation;
  }

  return adminNavigation
    .map(
      (
        section
      ) => ({
        ...section,

        links:
          section.links.filter(
            (
              link
            ) =>
              link.roles.includes(
                role
              )
          )
      })
    )
    .filter(
      (
        section
      ) =>
        section.links.length
    );
}