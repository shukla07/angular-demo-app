import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SchedulerInterfaceModule} from '@sourcefuse/ngx-scheduler';
import {DashboardComponent} from './dashboard.component';
import {DashboardRoutingModule} from './dashboard-routing.module';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {CountdownModule} from 'ngx-countdown';
import {NgxPermissionsModule} from 'ngx-permissions';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ThemeModule.forRoot(),
    CountdownModule,
    NgxPermissionsModule.forChild(),
    SchedulerInterfaceModule,
  ],
})
export class DashboardModule {}
