import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {SchedulerEvent} from '@sourcefuse/ngx-scheduler/lib/types';

@Injectable()
export class GetFreeBusyAdapter implements IAdapter<SchedulerEvent> {
  adaptToModel(resp: any): SchedulerEvent {
    return resp;
  }

  adaptFromModel(data: SchedulerEvent) {
    let userIds = [];
    if (data.userId) {
      userIds.push(data.userId);
    }
    if (data.attendees?.length) {
      userIds = [...userIds, ...data.attendees.map(a => a.id)];
      userIds = [...new Set(userIds)];
    }

    return {
      timeMax: data.endTime,
      timeMin: data.startTime,
      items: userIds.map(userId => {
        const obj = {
          id: userId,
        };
        if (data.id) {
          obj['eventId'] = {
            neq: data.id,
          };
        }
        return obj;
      }),
    };
  }
}
