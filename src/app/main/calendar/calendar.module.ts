import {NgModule} from '@angular/core';
import {CalendarComponent} from './calendar.component';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {SchedulerInterfaceModule} from '@sourcefuse/ngx-scheduler';
import {CalendarRoutingModule} from './calendar-routing.module';
import {CalendarService} from './calendar.service';
import {EventAdapter} from './adapters/create-event-adapter.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {EditEventAdapter} from './adapters/edit-event-adapter.service';
import {CreateAttendeeAdapter} from './adapters/create-attendee-adapter.service';
import {EditAttendeeAdapter} from './adapters/edit-attendee-adapter.service';
import {GetQuickNotesAdapter} from './adapters/get-quick-notes-adapter.service';
import {SendQuickResponseAdapter} from './adapters/send-quick-response-adapter.service';
import {GetFreeBusyAdapter} from './adapters/get-freebusy-status-adapter.service';
import {GetEventsByUsersAdapter} from './adapters/get-events-by-users-adapter.service';
import {ProposeNewTimeAdapter} from './adapters/propose-new-time-adapter.service';
import {SendRsvpResponseAdapter} from './adapters/send-rsvp-response-adapter.service';
import {GetAddressBookUserAdapter} from './adapters/get-addressbook-user-adapter.service';
import {BusyEventComponent} from './busy-event/busy-event.component';
// sonarignore:start
import {DateTimePickerModule} from '@syncfusion/ej2-angular-calendars';
// sonarignore:end

@NgModule({
  declarations: [CalendarComponent, BusyEventComponent],
  imports: [
    SchedulerInterfaceModule,
    DateTimePickerModule,
    CalendarRoutingModule,
    ThemeModule.forRoot(),
  ],
  providers: [
    CalendarService,
    EventAdapter,
    UserSessionStoreService,
    GetAddressBookUserAdapter,
    EditEventAdapter,
    CreateAttendeeAdapter,
    EditAttendeeAdapter,
    GetQuickNotesAdapter,
    SendQuickResponseAdapter,
    GetFreeBusyAdapter,
    GetEventsByUsersAdapter,
    ProposeNewTimeAdapter,
    SendRsvpResponseAdapter,
  ],
})
export class CalendarModule {}
