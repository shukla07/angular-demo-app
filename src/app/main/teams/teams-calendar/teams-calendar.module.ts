import {NgModule} from '@angular/core';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {SchedulerInterfaceModule} from '@sourcefuse/ngx-scheduler';
import {TeamsCalendarService} from './teams-calendar-service';
import {GetTeamMembersAdapter} from './adapters/get-team-members-adapter.service';
import {TeamsCalendarComponent} from './teams-calendar.component';
import {TeamsCalendarRoutingModule} from './teams-calendar-routing.module';
import {GetTeamEventsAdapter} from './adapters/get-team-events-adapter.service';
import {NgxPermissionsModule} from 'ngx-permissions';

@NgModule({
  declarations: [TeamsCalendarComponent],
  imports: [
    SchedulerInterfaceModule,
    TeamsCalendarRoutingModule,
    ThemeModule.forRoot(),
    NgxPermissionsModule,
  ],
  providers: [
    TeamsCalendarService,
    GetTeamMembersAdapter,
    GetTeamEventsAdapter,
  ],
})
export class TeamsCalendarModule {}
