import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {AttendeeInfo} from '@sourcefuse/ngx-scheduler/lib/types';

@Injectable()
export class EditAttendeeAdapter implements IAdapter<AttendeeInfo[]> {
  adaptToModel(resp: any): AttendeeInfo[] {
    return resp;
  }

  adaptFromModel(attendees: AttendeeInfo[]) {
    const attendeeFieldMapper = {
      id: 'identifier',
      attendeeId: 'id',
      response: 'responseStatus',
      deleted: 'deleted',
      isOrganizer: 'isOrganizer'
    };
    return attendees.map(data => {
      const requestObj = {};
      Object.getOwnPropertyNames(data).forEach(prop => {
        if (attendeeFieldMapper[prop]) {
          requestObj[attendeeFieldMapper[prop]] = data[prop];
        }
      });
      return requestObj;
    });
  }
}
