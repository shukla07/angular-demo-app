import { IAdapter } from '@vmsl/core/api/adapters/i-adapter';
import { Injectable } from '@angular/core';
import { Queue } from '../model/queue.model';
import * as moment from 'moment';
import { UserSessionStoreService } from '@vmsl/core/store/user-session-store.service';
import { RoleType } from '@vmsl/core/enums';

@Injectable()
export class ScheduleQueueAdapter implements IAdapter<Queue> {
  constructor(private readonly store: UserSessionStoreService) { }
  adaptToModel(resp: any): Queue {
    const queue = new Queue();
    queue.callerRoleName = resp.requestorRoleName;
    queue.callerFirstName = resp.requestorFirstName;
    queue.callerLastName = resp.requestorLastName;
    queue.callerProfile = resp.photoUrl;
    queue.teamName = resp.teamName;
    queue.status = 'queued';
    queue.createdOn = `Event created ${moment
      .utc(moment().diff(moment(resp.createdOn)))
      .format('HH:mm')} hrs ago`;
    queue.queueId = resp.teamQueueId;
    queue.teamId = resp.teamId;
    queue.eventId = resp.requestBodyEvent.id;
    queue.callType = resp?.requestBodyCall?.extMetadata.meetingInfo.type;
    queue.startTime = moment(resp.requestBodyEvent?.startDateTime).format('LT');
    queue.endTime = moment(resp.requestBodyEvent?.endDateTime).format('LT');
    queue.date = moment(resp.requestBodyEvent?.startDateTime).isSame(
      new Date(),
      'date',
    )
      ? 'Today'
      : moment(resp.requestBodyEvent?.startDateTime).format('MMM Do');
    if (resp.status === 'manager-escalation') {
      queue.managerEscalated = true;
    }
    if (resp.status === 'director-escalation') {
      queue.directorEscalated = true;
    }
    for (const team of this.store.getTeams()) {
      if (team.teamId === queue.teamId) {
        queue.members = team.allMembers.filter(
          item =>
            item.user_id !== this.store.getUser().id &&
            item.role_type !== RoleType.hcp,
        );
      }
    }
    return queue;
  }

  adaptFromModel(data: Queue) {
    return data;
  }
}
