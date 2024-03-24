import {Injectable} from '@angular/core';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {NotificationsHistory} from '../models/notifications-list.model';
import * as moment from 'moment';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';

@Injectable()
export class GetNotificationsListAdapter
  implements IAdapter<NotificationsHistory[]> {
  constructor(private readonly store: UserSessionStoreService) {}
  adaptToModel(resp: any) {
    if (resp) {
      const notificationInfo = new NotificationsHistory();
      const notificationBody = JSON.parse(resp.body);
      notificationInfo.notificationId = resp.id;
      notificationInfo.isRespondedTo = resp.isRead;
      notificationInfo.type = notificationBody.notificationType;
      notificationInfo.response = notificationBody.rsvpStatus;
      notificationInfo.eventId = notificationBody.notificationData.eventId;
      notificationInfo.proposedTime = new Date(
        notificationBody.notificationData.proposedTime,
      );
      notificationInfo.proposedTimeExact = notificationBody.notificationData.proposedTimeExact;
      const startDate = moment(
        notificationBody.notificationData.startDateTime,
      ).format('YYYY-MM-DD HH:mm');
      const currentTime = moment().format('YYYY-MM-DD HH:mm');
      if (moment(currentTime).isAfter(startDate)) {
        notificationInfo.status = 'completed';
      } else {
        notificationInfo.status = 'pending';
      }
      if (resp.createdBy === this.store.getUser().userTenantId) {
        notificationInfo.isOrganiser = true;
      }
      notificationInfo.body = notificationBody.notificationData.body;
      notificationInfo.createdOn = moment(
        resp.createdOn,
        'YYYY-MM-DDTHH:mm Z',
      ).format('MMMM Do YYYY, hh:mm A');
      return notificationInfo;
    }
    return resp;
  }
  adaptFromModel(data: Partial<NotificationsHistory[]>) {
    return data;
  }
}
