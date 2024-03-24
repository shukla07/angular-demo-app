import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {SchedulerEvent} from '@sourcefuse/ngx-scheduler/lib/types';
import {Helper} from '../shared/utils';

@Injectable()
export class EditEventAdapter implements IAdapter<SchedulerEvent> {
  adaptToModel(resp: any): SchedulerEvent {
    return resp;
  }

  adaptFromModel(data: SchedulerEvent) {
    const requestObj = {};

    Object.getOwnPropertyNames(data).forEach(prop => {
      if (Helper.eventFieldMapper[prop]) {
        if (prop === 'meetingType') {
          requestObj['extMetadata'] = {
            meetingInfo: {
              type: data.meetingType,
            },
          };
        } else {
          requestObj[Helper.eventFieldMapper[prop]] = data[prop];
        }
      }
    });
    return requestObj;
  }
}
