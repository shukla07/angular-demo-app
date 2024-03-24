import {Routes, RouterModule} from '@angular/router';
import {MainComponent} from './main.component';
import {NgModule} from '@angular/core';
import {NgxPermissionsGuard} from 'ngx-permissions';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {environment} from '@vmsl/env/environment';
import {CalendarComponent} from './calendar/calendar.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [NgxPermissionsGuard],
      },
      {
        path: 'user',
        loadChildren: () =>
          import('./user/user.module').then(m => m.UserModule),
      },
      {
        path: 'contacts',
        loadChildren: () =>
          import('./address-book/address-book.module').then(
            m => m.AddressBookModule,
          ),
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [
              Permission.ViewOwnAddressBook,
              Permission.ViewRefererAddressBook,
            ],
            redirectTo: environment.homePath,
          },
        },
      },
      {
        path: 'mailbox',
        loadChildren: () =>
          import('./mailbox/mailbox.module').then(m => m.MailboxModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [Permission.CombinedInmailAllowed],
            redirectTo: environment.homePath,
          },
        },
      },
      {
        path: 'calendar/:id',
        component: CalendarComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [Permission.ViewCalendar],
            redirectTo: environment.homePath,
          },
        },
      },
      {
        path: 'calendar',
        component: CalendarComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [Permission.ViewCalendar],
            redirectTo: environment.homePath,
          },
        },
      },
      {
        path: 'profile/:id',
        loadChildren: () =>
          import('./profile/profile.module').then(m => m.ProfileModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [Permission.ViewTenantUser],
            redirectTo: environment.homePath,
          },
        },
      },
      {
        path: 'myProfile',
        loadChildren: () =>
          import('./profile/profile.module').then(m => m.ProfileModule),
        canActivate: [NgxPermissionsGuard],
      },
      {
        path: 'teams',
        loadChildren: () =>
          import('./teams/teams.module').then(m => m.TeamsModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [
              Permission.ViewOwnTenantTeams,
              Permission.ViewTenantTeamsHCP,
              Permission.ViewTenantTeamsDirector,
            ],
            redirectTo: environment.homePath,
          },
        },
      },
      {
        path: 'meeting-details/:id',
        loadChildren: () =>
          import('./meeting-details/meeting-details.module').then(
            m => m.MeetingDetailsModule,
          ),
      },
      {
        path: 'teams-management',
        loadChildren: () =>
          import('./teams-management/teams-management.module').then(
            m => m.TeamsManagementModule,
          ),
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [Permission.ViewTenantTeams],
            redirectTo: environment.homePath,
          },
        },
      },
      {
        path: 'audit-logs',
        loadChildren: () =>
          import('./audit-logs/audit-logs.module').then(m => m.AuditLogsModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [
              Permission.ViewOwnAudit,
              Permission.ViewTenantAudit,
              Permission.ViewAssignedAudit,
            ],
            except: [Permission.ViewRefererAddressBook],
            redirectTo: environment.homePath,
          },
        },
      },
      {
        path: 'meeting',
        loadChildren: () =>
          import('./audio-video/audio-video.module').then(
            m => m.AudioVideoModule,
          ),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./settings/settings.module').then(m => m.SettingsModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            except: [Permission.ViewRefererAddressBook],
            redirectTo: environment.homePath,
          },
        },
      },
      {
        path: 'hcp-management',
        loadChildren: () =>
          import('./hcp-management/hcp-management.module').then(
            m => m.HcpManagementModule,
          ),
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [
              Permission.ViewRegisteredRequests,
              Permission.UpdateRegisteredRequests,
            ],
            redirectTo: environment.homePath,
          },
        },
      },
      {
        path: 'notifications-list',
        loadChildren: () =>
          import('./notifications-list/notifications-list.module').then(
            m => m.NotificationsListModule,
          ),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./reports/reports.module').then(m => m.ReportsModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [
              Permission.ViewTenantReport,
              Permission.ViewOwnReport,
              Permission.ViewAssignedUserReport,
            ],
            redirectTo: environment.homePath,
          },
        },
      },
      {
        path: 'disease-areas-management',
        loadChildren: () =>
          import('./disease-areas/disease-areas.module').then(
            m => m.DiseaseAreasModule,
          ),
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [Permission.AddDivisionTags],
            redirectTo: environment.homePath,
          },
        },
      },
      {
        path: 'therapeutic-areas-management',
        loadChildren: () =>
          import(
            './therapeutic-areas-management/therapeutic-areas-management.module'
          ).then(m => m.TherapeuticAreasManagementModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [Permission.AddDivisionTags],
            redirectTo: environment.homePath,
          },
        },
      },
      {
        path: 'territories-management',
        loadChildren: () =>
          import('./territories-management/territories-management.module').then(
            m => m.TerritoriesManagementModule,
          ),
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [Permission.AddDivisionTags],
            redirectTo: environment.homePath,
          },
        },
      },
      {
        path: 'job-titles-management',
        loadChildren: () =>
          import('./job-titles-management/job-titles-management.module').then(
            m => m.JobTitlesManagementModule,
          ),
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [Permission.CreateTenantJobTitles],
            redirectTo: environment.homePath,
          },
        },
      },
      {
        path: 'content-management',
        loadChildren: () =>
          import('./content-management/content-management.module').then(
            m => m.ContentManagementModule,
          ),
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [
              Permission.ViewTenantContents && Permission.ContentModuleAllowed,
            ],
            redirectTo: environment.homePath,
          },
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainRoutingModule {}
