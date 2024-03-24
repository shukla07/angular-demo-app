import {Injectable} from '@angular/core';
import {ApiService} from '@vmsl/core/api/api.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {Observable} from 'rxjs';
import {EventAdapter} from './adapters/create-event-adapter.service';
import {GetSchedulerEvents} from './commands/get-scheduler-events.command';
import {CreateEventCommand} from './commands/create-event.command';
import {
  SchedulerEvent,
  UserInfo,
  AttendeeInfo,
} from '@sourcefuse/ngx-scheduler/lib/types';
import {GetUsers} from './commands/get-users.command';
import {DeleteEventCommand} from './commands/delete-event.command';
import {AnyAdapter} from '@vmsl/core/api/adapters/any-adapter.service';
import {EditEventCommand} from './commands/edit-event.command';
import {EditEventAdapter} from './adapters/edit-event-adapter.service';
import {EditAttendeeCommand} from './commands/edit-attendee.command';
import {CreateAttendeeCommand} from './commands/create-attendee.command';
import {CreateAttendeeAdapter} from './adapters/create-attendee-adapter.service';
import {EditAttendeeAdapter} from './adapters/edit-attendee-adapter.service';
import {QuickNotes} from './models/quick-notes-templates.model';
import {EventFilters} from './models/types';
import {GetQuickNotesCommand} from './commands/get-quick-notes.command';
import {GetQuickNotesAdapter} from './adapters/get-quick-notes-adapter.service';
import {UpdateRsvpCommand} from './commands/update-rsvp.command';
import {SendQuickResponseAdapter} from './adapters/send-quick-response-adapter.service';
import {GetFreeBusyAdapter} from './adapters/get-freebusy-status-adapter.service';
import {CheckFreeBusyCommand} from './commands/check-freebusy-status.command';
import {GetEventsByUsersCommand} from './commands/get-events-by-users.command';
import {GetEventsByUsersAdapter} from './adapters/get-events-by-users-adapter.service';
import {ProposeNewTimeAdapter} from './adapters/propose-new-time-adapter.service';
import {SendRsvpResponseAdapter} from './adapters/send-rsvp-response-adapter.service';
import {GetAddressBookUserAdapter} from './adapters/get-addressbook-user-adapter.service';
import {GetOwnerList} from './commands/get-owner-list.command';
import {HttpParams} from '@angular/common/http';
import {CheckDownHierarchyCommand} from './commands/check-down-hierarchy.comand';
import {GetEventByIdCommand} from './commands/get-event-by-id-command';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  constructor(
    private readonly eventAdapter: EventAdapter,
    private readonly createAttendeeAdapter: CreateAttendeeAdapter,
    private readonly editAttendeeAdapter: EditAttendeeAdapter,
    private readonly userAdapter: GetAddressBookUserAdapter,
    private readonly quickNotesAdapter: GetQuickNotesAdapter,
    private readonly getEventsByUsersAdapter: GetEventsByUsersAdapter,
    private readonly freeBusyAdapter: GetFreeBusyAdapter,
    private readonly apiService: ApiService,
    private readonly anyAdapter: AnyAdapter,
    private readonly editEventAdapter: EditEventAdapter,
    private readonly sendQuickResponseAdapter: SendQuickResponseAdapter,
    private readonly sendRsvpResponseAdapter: SendRsvpResponseAdapter,
    private readonly proposeNewTimeAdapter: ProposeNewTimeAdapter,
    private readonly store: UserSessionStoreService,
  ) {}

  getSchedulerEvents(userId: string): Observable<SchedulerEvent[]> {
    const command: GetSchedulerEvents<SchedulerEvent> = new GetSchedulerEvents(
      this.apiService,
      this.eventAdapter,
      this.store.getUser().tenantId,
      userId,
    );

    return command.execute();
  }

  getUsers(): Observable<UserInfo[]> {
    const command: GetUsers<UserInfo> = new GetUsers(
      this.apiService,
      this.userAdapter,
      this.store.getUser().tenantId,
      this.store.getUser().id,
    );

    return command.execute();
  }

  getOwners(): Observable<UserInfo[]> {
    const command: GetOwnerList<UserInfo> = new GetOwnerList(
      this.apiService,
      this.userAdapter,
      this.store.getUser().tenantId,
      this.store.getUser().id,
    );

    return command.execute();
  }

  getQuickNotes(): Observable<QuickNotes[]> {
    const command: GetQuickNotesCommand<QuickNotes> = new GetQuickNotesCommand(
      this.apiService,
      this.quickNotesAdapter,
      this.store.getUser().tenantId,
    );

    return command.execute();
  }

  // sonarignore:start
  proposeNewTime(data, eventId, attendeeId) {
    const command: UpdateRsvpCommand<any> = new UpdateRsvpCommand(
      this.apiService,
      this.proposeNewTimeAdapter,
      this.store.getUser().tenantId,
      eventId,
      attendeeId,
    );
    // sonarignore:end

    command.parameters = {
      data: data,
    };
    return command.execute();
  }

  createEvent(data): Observable<SchedulerEvent> {
    const command: CreateEventCommand<SchedulerEvent> = new CreateEventCommand(
      this.apiService,
      this.eventAdapter,
      this.store.getUser().tenantId,
    );

    command.parameters = {
      data: data,
    };

    return command.execute();
  }

  updateEvent(changedEventValues, eventId) {
    const command: EditEventCommand<SchedulerEvent> = new EditEventCommand(
      this.apiService,
      this.editEventAdapter,
      this.store.getUser().tenantId,
      eventId,
    );
    command.parameters = {
      data: changedEventValues,
    };
    return command.execute();
  }
  createAttendees(
    attendees: AttendeeInfo[],
    eventId,
  ): Observable<AttendeeInfo[]> {
    const command: CreateAttendeeCommand<AttendeeInfo[]> =
      new CreateAttendeeCommand(
        this.apiService,
        this.createAttendeeAdapter,
        this.store.getUser().tenantId,
        eventId,
      );
    attendees.forEach(attendee => {
      attendee['eventId'] = eventId;
      attendee['extId'] = this.store.getUser().tenantId;
    });
    command.parameters = {
      data: attendees,
    };

    return command.execute();
  }

  updateAttendees(changedAttendees, eventId) {
    const command: EditAttendeeCommand<AttendeeInfo[]> =
      new EditAttendeeCommand(
        this.apiService,
        this.editAttendeeAdapter,
        this.store.getUser().tenantId,
        eventId,
      );
    command.parameters = {
      data: changedAttendees,
    };
    return command.execute();
  }

  deleteEvent(userId): Observable<Object> {
    const command: DeleteEventCommand<Object> = new DeleteEventCommand(
      this.apiService,
      this.anyAdapter,
      this.store.getUser().tenantId,
      userId,
    );
    command.parameters = {
      observe: 'body',
    };
    return command.execute();
  }

  sendQuickResponse(data, eventId, attendeeId) {
    const command: UpdateRsvpCommand<QuickNotes> = new UpdateRsvpCommand(
      this.apiService,
      this.sendQuickResponseAdapter,
      this.store.getUser().tenantId,
      eventId,
      attendeeId,
    );
    command.parameters = {
      data: data,
    };
    return command.execute();
  }

  sendRsvpResponse(attendee: AttendeeInfo, eventId) {
    const command: UpdateRsvpCommand<AttendeeInfo> = new UpdateRsvpCommand(
      this.apiService,
      this.sendRsvpResponseAdapter,
      this.store.getUser().tenantId,
      eventId,
      attendee.attendeeId,
    );
    command.parameters = {
      data: attendee,
    };
    return command.execute();
  }

  // sonarignore:start
  getUserFreeBusyStatus(event: SchedulerEvent): Observable<any> {
    const command: CheckFreeBusyCommand<SchedulerEvent> =
      new CheckFreeBusyCommand(
        this.apiService,
        this.freeBusyAdapter,
        this.store.getUser().tenantId,
      );
    // sonarignore:end

    command.parameters = {
      data: event,
    };
    return command.execute();
  }
  // sonarignore:start
  getEventsByUserIds(
    filters: EventFilters,
    userIds?: string[],
    userId2?: string,
    allocationView = false,
  ): Observable<any> {
    const command: GetEventsByUsersCommand<any> = new GetEventsByUsersCommand(
      this.apiService,
      this.getEventsByUsersAdapter,
      this.store.getUser().tenantId,
    );
    // sonarignore:end
    let params = new HttpParams();
    let query = {};
    const conditionsForStartEndDate = [
      {startDateTime: {between: [filters.startDate, filters.endDate]}},
      {endDateTime: {between: [filters.startDate, filters.endDate]}},
      {
        and: [
          {
            startDateTime: {lte: filters.startDate},
          },
          {
            endDateTime: {gte: filters.endDate},
          },
        ],
      },
    ];
    if (filters?.eventId) {
      query = {
        id: filters.eventId,
      };
    } else if (userId2) {
      query = {
        where: {
          and: [
            {
              or: conditionsForStartEndDate,
            },
            {
              or: [
                {identifier: userId2},
                {
                  attendeeIdentifier: userId2,
                },
              ],
            },
          ],
        },
        include: [{relation: 'attendees'}],
      };
    } else {
      query = {
        where: {
          or: conditionsForStartEndDate,
        },
        include: [{relation: 'attendees'}],
      };
    }

    params = params.set('filter', JSON.stringify(query));

    if (allocationView === true) {
      userIds.push('allocationView');
    }

    command.parameters = {
      data: userIds?.length ? userIds : [this.store.getUser().id],
      query: params,
    };
    return command.execute();
  }

  // sonarignore:start
  checkDownHierarchy(loggedInUserId: string, contactId: string) {
    const command: CheckDownHierarchyCommand<any> =
      new CheckDownHierarchyCommand(
        this.apiService,
        this.anyAdapter,
        this.store.getUser().tenantId,
        loggedInUserId,
        contactId,
      );
    // sonarignore:end

    return command.execute();
  }

  // sonarignore:start
  getEventById(eventId: string): Observable<any> {
    const command: GetEventsByUsersCommand<any> = new GetEventsByUsersCommand(
      this.apiService,
      this.getEventsByUsersAdapter,
      this.store.getUser().tenantId,
    );
    // sonarignore:end

    const query = {
      where: {
        id: eventId,
      },
      include: [{relation: 'attendees'}],
    };
    let params = new HttpParams();
    params = params.set('filter', JSON.stringify(query));

    command.parameters = {
      data: [this.store.getUser().id],
      query: params,
    };
    return command.execute();
  }

  getEventByItsId(eventId): Observable<Object> {
    const command: GetEventByIdCommand<Object> = new GetEventByIdCommand(
      this.apiService,
      this.anyAdapter,
      this.store.getUser().tenantId,
      eventId,
    );

    return command.execute();
  }
}
