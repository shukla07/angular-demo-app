import {Injectable} from '@angular/core';
import {ApiService} from '@vmsl/core/api/api.service';
import {GetNotificationsListCommand} from '../commands/get-notifications-list.command';
import {Observable} from 'rxjs';
import {GetNotificationsListAdapter} from '../adapters/get-notifications-list-adapter.service';
import {NotificationsHistory} from '../models/notifications-list.model';
import {HttpParams} from '@angular/common/http';
import {AnyAdapter} from '@vmsl/core/api/adapters/any-adapter.service';
import {UpdtaeNotificationsCommand} from '../commands/update-notification.command';

@Injectable()
export class NotificationsListingFacadeService {
  constructor(
    private readonly apiService: ApiService,
    private readonly anyAdapter: AnyAdapter,
    private readonly getNotificationsAdapter: GetNotificationsListAdapter,
  ) {}

  getNotificationsHistory(): Observable<NotificationsHistory[]> {
    const command: GetNotificationsListCommand<NotificationsHistory> = new GetNotificationsListCommand(
      this.apiService,
      this.getNotificationsAdapter,
    );
    const queryData = {
      order: 'createdOn DESC',
    };

    let params = new HttpParams();
    params = params.set('filter', JSON.stringify(queryData));
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  updateNotification(notificationId): Observable<Object> {
    const command: UpdtaeNotificationsCommand<{
      isRead: boolean;
    }> = new UpdtaeNotificationsCommand(
      this.apiService,
      this.anyAdapter,
      notificationId,
    );
    command.parameters = {
      observe: 'body',
      data: {isRead: true},
    };
    return command.execute();
  }
}
