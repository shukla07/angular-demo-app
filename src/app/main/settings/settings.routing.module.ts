import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {SettingsComponent} from './settings.component';
import {ChangePasswordComponent} from './change-password/change-password.component';
import {NotificationSettingComponent} from './notification-setting/notification-setting.component';
import {TenantCalendarConfigComponent} from './tenant-calendar-config/tenant-calendar-config.component';
import {NgxPermissionsGuard} from 'ngx-permissions';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {environment} from '@vmsl/env/environment';
import {TenantSsoConfigComponent} from './tenant-sso-config/tenant-sso-config.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,

    children: [
      {
        path: '',
        redirectTo: 'notification',
        pathMatch: 'full',
      },
      {
        path: 'change-password',
        component: ChangePasswordComponent,
      },
      {
        path: 'notification',
        component: NotificationSettingComponent,
      },
      {
        path: 'calendar-config',
        component: TenantCalendarConfigComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [
              Permission.CreateAzureTenantConfig,
              Permission.UpdateAzureTenantConfig,
            ],
            redirectTo: environment.homePath,
          },
        },
      },
      {
        path: 'sso-config',
        component: TenantSsoConfigComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [
              Permission.CreateAzureTenantConfig,
              Permission.UpdateAzureTenantConfig,
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
export class SettingsRoutingModule {}
