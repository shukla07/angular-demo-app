import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {AttendeeInfo} from '@sourcefuse/ngx-scheduler/lib/types';

@Injectable()
export class SendRsvpResponseAdapter implements IAdapter<AttendeeInfo> {
  adaptToModel(resp: any): AttendeeInfo {
    return resp;
  }

  adaptFromModel(data: AttendeeInfo) {
    let rsvpStatus = '';
    switch (data.response) {
      case 'accepted':
        rsvpStatus = 'Accept';
        break;
      case 'declined':
        rsvpStatus = 'Decline';
        break;
      default:
    }
    return {
      rsvpStatus: rsvpStatus,
    };
  }
}
