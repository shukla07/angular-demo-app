import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {SchedulerEvent} from '@sourcefuse/ngx-scheduler/lib/types';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {Helper} from '../shared/utils';

@Injectable()
export class EventAdapter implements IAdapter<SchedulerEvent> {
  constructor(private readonly store: UserSessionStoreService) {}

  adaptToModel(resp: any): SchedulerEvent {
    return Helper.mapApiEventToSchedulerEvent(resp, this.store.getUser().id);
  }

  adaptFromModel(data: SchedulerEvent) {
    let attendees;
    if (data && data.attendees) {
      attendees = data.attendees.map(at => {
        return {
          identifier: at.id,
          isOrganizer: at.isOrganizer,
          eventId: '',
          extId: data['extId'],
          extMetadata: {},
          responseStatus: at.response,
        };
      });
    }
    return {
      endDateTime: data.endTime,
      identifier: data['identifier'],
      startDateTime: data.startTime,
      summary: data.title,
      attendees: attendees,
      extMetadata: {
        meetingInfo: {
          type: data.meetingType,
        },
      },
      extId: data['extId'],
      isBusyEvent: data['isBusyEvent'],
    };
  }
}
