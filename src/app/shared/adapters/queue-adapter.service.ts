import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {Queue} from '../model/queue.model';
import * as moment from 'moment';

@Injectable()
export class TeamQueueAdapter implements IAdapter<Queue> {
  adaptToModel(resp: any): Queue {
    const maxTime = 45;
    const queue = new Queue();
    queue.callerRoleName = resp.requestorRoleName;
    queue.callerFirstName = resp.requestorFirstName;
    queue.callerLastName = resp.requestorLastName;
    queue.callerProfile = resp.photoUrl;
    queue.attendeeFirstName = resp.assignedToFirstName;
    queue.attendeeLastName = resp.assignedToLastName;
    queue.teamName = resp.teamName;
    queue.status = resp.teamQueueStatus;
    const timeLeft = moment().diff(moment(resp.createdOn).format(), 'seconds');
    queue.timeLeft = {
      leftTime: timeLeft < maxTime ? maxTime - timeLeft : timeLeft,
      format: 'mm:ss',
    };
    queue.queueId = resp.teamQueueId;
    queue.teamId = resp.teamId;
    queue.callType = resp?.requestBodyCall?.extMetadata.meetingInfo.type;
    return queue;
  }

  adaptFromModel(data: Queue) {
    return data;
  }
}
