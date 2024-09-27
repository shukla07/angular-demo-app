import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {AttendeeInfo} from '@sourcefuse/ngx-scheduler/lib/types';

@Injectable()
export class CreateAttendeeAdapter implements IAdapter<AttendeeInfo[]> {
  adaptToModel(resp: any): AttendeeInfo[] {
    return resp;
  }

  adaptFromModel(attendees: AttendeeInfo[]) {
    return attendees.map(at => {
      return {
        identifier: at.id,
        isOrganizer: at.isOrganizer,
        responseStatus: at.response || 'needsAction',
        eventId: at['eventId'],
        extId: at['extId'],
        extMetadata: {},
      };
    });
  }
}
