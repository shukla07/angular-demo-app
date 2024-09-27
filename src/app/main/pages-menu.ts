import {NbMenuItem} from '@nebular/theme';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {FontPack} from '@vmsl/core/enums';

const CustomIcons = 'custom-icons';

export const menuItem = (): NbMenuItem[] => {
  return [
    {
      title: 'Dashboard',
      icon: {icon: 'icon-dashboard', pack: CustomIcons},
      link: '/main/home',
      home: true,
      data: {
        view: 'Dashboard',
        permission: Permission.CanViewDashboard,
      },
    },
    {
      title: 'Users',
      icon: {icon: 'icon-users', pack: CustomIcons},
      expanded: false,
      data: {
        view: 'Dashboard',
        permission: Permission.ViewTenantUserListing,
      },
      children: [
        {
          title: 'User Management',
          link: '/main/user',
          home: false,
        },
        {
          title: 'HCP Registrations',
          link: '/main/hcp-management',
          home: false,
        },
      ],
    },
    {
      title: 'Team Management',
      icon: {icon: 'icon-team-management', pack: CustomIcons},
      link: '/main/teams-management',
      home: false,
      data: {
        view: 'Dashboard',
        permission: [Permission.ViewTenantTeams],
      },
    },
    {
      title: 'Calendar',
      icon: {icon: 'icon-calender', pack: CustomIcons},
      link: '/main/calendar',
      home: false,
      data: {
        permission: [Permission.ViewCalendar],
        view: 'Dashboard',
      },
    },
    {
      title: 'Teams',
      icon: {icon: 'icon-teams', pack: CustomIcons},
      link: '/main/teams',
      home: false,
      data: {
        view: 'Dashboard',
        permission: [
          Permission.ViewTenantTeamsDirector,
          Permission.ViewOwnTenantTeams,
          Permission.ViewTenantTeamsHCP,
        ],
      },
    },
    {
      title: 'Contacts',
      icon: {icon: 'icon-contacts', pack: CustomIcons},
      link: '/main/contacts',
      home: false,
      data: {
        view: 'Dashboard',
        permission: [
          Permission.ViewOwnAddressBook,
          Permission.ViewRefererAddressBook,
        ],
      },
    },
    {
      title: 'Medical onDemand',
      icon: {icon: 'stethoscope', pack: CustomIcons},
      home: true,
      data: {
        view: 'Dashboard',
        permission: [Permission.CanSearchMaContacts],
      },
    },
    {
      title: 'InMail',
      icon: {icon: 'envelope', pack: FontPack.FontAwesomeRegular},
      home: false,
      data: {
        view: 'Dashboard',
        permission: [Permission.CombinedInmailAllowed],
      },
      children: [
        {
          title: 'Compose Mail',
          link: '/main/mailbox/compose-email',
          home: false,
        },
        {
          title: 'Inbox',
          link: '/main/mailbox/inbox',
          home: false,
        },
        {
          title: 'Sent Mail',
          link: '/main/mailbox/send',
          home: false,
        },
        {
          title: 'Important',
          link: '/main/mailbox/important',
          home: false,
        },
        {
          title: 'Drafts',
          link: '/main/mailbox/drafts',
          home: false,
        },
        {
          title: 'Trash',
          link: '/main/mailbox/trash',
          home: false,
        },
      ],
    },
    {
      title: 'Audit Logs',
      icon: {icon: 'icon-auditlog', pack: CustomIcons},
      link: '/main/audit-logs',
      home: true,
      data: {
        view: 'Dashboard',
        permission: [Permission.ViewTenantAudit],
      },
    },
    {
      title: 'Reports',
      icon: {icon: 'icon-reports', pack: CustomIcons},
      expanded: false,
      data: {
        view: 'Dashboard',
        permission: [
          Permission.ViewTenantReport,
          Permission.ViewOwnReport,
          Permission.ViewAssignedUserReport,
        ],
      },
      children: [
        {
          title: 'Meeting Reports',
          children: [
            {
              title: 'All Meeting Report',
              link: '/main/reports/all-conference',
              home: false,
            },
            {
              title: 'No Show Report',
              link: '/main/reports/no-show',
              home: false,
            },
            {
              title: 'Team Missed Call Report',
              link: '/main/reports/team-missed-call',
              home: false,
            },
            {
              title: 'MoD Report',
              link: '/main/reports/mod',
              home: false,
            },
            {
              title: 'MoD Metric Report',
              link: '/main/reports/mod-metric',
              home: false,
            },
          ],
        },
      ],
    },
    {
      title: 'Territory Management',
      icon: {icon: 'icon-territories', pack: CustomIcons},
      link: '/main/territories-management',
      home: true,
      data: {
        view: 'Dashboard',
        permission: [Permission.AddDivisionTags],
      },
    },
    {
      title: 'Product/Disease Area Management',
      icon: {icon: 'icon-disease', pack: CustomIcons},
      link: '/main/disease-areas-management',
      home: true,
      data: {
        view: 'Dashboard',
        permission: [Permission.AddDivisionTags],
      },
    },
    {
      title: 'Therapeutic Area Management',
      icon: {icon: 'icon-therapeutic', pack: CustomIcons},
      link: '/main/therapeutic-areas-management',
      home: true,
      data: {
        view: 'Dashboard',
        permission: [Permission.AddDivisionTags],
      },
    },
    {
      title: 'Role Management',
      icon: {icon: 'job-title', pack: CustomIcons},
      link: '/main/job-titles-management',
      home: true,
      data: {
        view: 'Dashboard',
        permission: [Permission.CreateTenantJobTitles],
      },
    },
    {
      title: 'Content Management',
      icon: {icon: 'content', pack: CustomIcons},
      link: '/main/content-management',
      home: true,
      data: {
        view: 'Dashboard',
        permission: [Permission.CombinedAdminContentAllowed],
      },
    },
    {
      title: 'Content',
      icon: {icon: 'content', pack: CustomIcons},
      link: '/main/content-management',
      home: true,
      data: {
        view: 'Dashboard',
        permission: [Permission.CombinedUserContentAllowed],
      },
    },
  ];
};
