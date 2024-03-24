import {Injectable} from '@angular/core';
import {ApiService} from '@vmsl/core/api/api.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {Observable} from 'rxjs';
import {NotificationTemplateCommand} from '../commands/notification-template.command';
import {Notification} from '../models/notification.model';
import {NotiTemplateListAdapter} from '../adapters/noti-template-list-adapter.service';
import {GetUserNotificationCommand} from '../commands/get-user-notification.command';
import {SaveUserNotifications} from '../commands/save-user-notification.command';

@Injectable()
export class NotificationFacadeService {
  constructor(
    private readonly apiService: ApiService,
    private readonly notiTemplateListAdapter: NotiTemplateListAdapter,
    private readonly store: UserSessionStoreService,
  ) {}

  getNotificationTemplate(): Observable<Notification[]> {
    const command: NotificationTemplateCommand<Notification> = new NotificationTemplateCommand(
      this.apiService,
      this.notiTemplateListAdapter,
    );

    return command.execute();
  }

  getUserNotifications(): Observable<Notification[]> {
    const command: GetUserNotificationCommand<Notification> = new GetUserNotificationCommand(
      this.apiService,
      this.notiTemplateListAdapter,
      this.store.getUser().tenantId,
      this.store.getUser().id,
    );

    return command.execute();
  }

  saveUserNotifications(data: Notification[]) {
    // sonarignore:start
    const command: SaveUserNotifications<any> = new SaveUserNotifications(
      this.apiService,
      this.notiTemplateListAdapter,
      this.store.getUser().tenantId,
      this.store.getUser().id,
    );
    // sonarignore:end

    command.parameters = {
      data: data,
    };

    return command.execute();
  }
}
