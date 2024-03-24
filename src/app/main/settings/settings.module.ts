import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {SettingsComponent} from './settings.component';
import {SettingsRoutingModule} from './settings.routing.module';
import {ChangePasswordComponent} from './change-password/change-password.component';
import {NotificationSettingComponent} from './notification-setting/notification-setting.component';
import {SettingsFacadeService} from './shared/facade/settings-facade.service';
import {NotificationFacadeService} from './shared/facade/notification-facade.service';
import {NotiTemplateListAdapter} from './shared/adapters/noti-template-list-adapter.service';
import {TenantCalendarConfigComponent} from './tenant-calendar-config/tenant-calendar-config.component';
import {TenantSsoConfigComponent} from './tenant-sso-config/tenant-sso-config.component';

@NgModule({
  declarations: [
    SettingsComponent,
    ChangePasswordComponent,
    NotificationSettingComponent,
    TenantCalendarConfigComponent,
    TenantSsoConfigComponent,
  ],
  imports: [CommonModule, SettingsRoutingModule, ThemeModule.forRoot()],
  providers: [
    SettingsFacadeService,
    NotificationFacadeService,
    NotiTemplateListAdapter,
  ],
})
export class SettingsModule {}
