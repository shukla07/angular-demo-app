import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {SchedulerEvent} from '@sourcefuse/ngx-scheduler/lib/types';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';

@Injectable()
export class ScheduleTeamMeetingAdapter implements IAdapter<SchedulerEvent> {
  constructor(private readonly store: UserSessionStoreService) {}

  adaptToModel(resp: any): any {
    return resp;
  }

  adaptFromModel(data: SchedulerEvent) {
    return {
      requestorId: this.store.getUser().id,
      tenantId: this.store.getUser().tenantId,
      requestType: 'scheduled-call',
      teamId: data['teamId'],
      callType: data.meetingType,
      requestBodyEvent: {
        endDateTime: data.endTime,
        identifier: this.store.getUser().id, //hcps id aka current user's id
        startDateTime: data.startTime,
        summary: data.title,
        extId: this.store.getUser().tenantId,
        extMetadata: {},
      },
    };
  }
}
