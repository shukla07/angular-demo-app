import {PatchAPICommand} from '@vmsl/core/core.module';
import {environment} from '@vmsl/env/environment';
import {ApiService} from '@vmsl/core/api/api.service';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';

export class UpdtaeNotificationsCommand<T> extends PatchAPICommand<T> {
  constructor(apiService: ApiService, adapter: IAdapter<T>, notificationId) {
    super(
      apiService,
      adapter,
      `${environment.userApiUrl}/notification-read/${notificationId}`,
    );
  }
}
