import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TeamsComponent} from './teams.component';
import {TeamsRoutingModule} from './teams-routing.module';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {NgxPermissionsModule} from 'ngx-permissions';
import {NgxPaginationModule} from 'ngx-pagination';
import {FilterPipeModule} from 'ngx-filter-pipe';
import {FlatpickrModule} from 'angularx-flatpickr';
import {RequestMeetingComponent} from './request-meeting/request-meeting.component';
import {TeamsCalendarModule} from './teams-calendar/teams-calendar.module';
// sonarignore:start
import {DateTimePickerModule} from '@syncfusion/ej2-angular-calendars';
// sonarignore:end

@NgModule({
  declarations: [TeamsComponent, RequestMeetingComponent],
  imports: [
    CommonModule,
    TeamsRoutingModule,
    DateTimePickerModule,
    ThemeModule.forRoot(),
    NgxPaginationModule,
    NgxPermissionsModule.forChild(),
    FilterPipeModule,
    FlatpickrModule.forRoot(),
    TeamsCalendarModule,
  ],
  providers: [],
})
export class TeamsModule {}
