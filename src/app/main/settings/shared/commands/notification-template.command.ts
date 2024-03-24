import {GetListAPICommand} from '@vmsl/core/core.module';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {ApiService} from '@vmsl/core/api/api.service';
import {environment} from '@vmsl/env/environment';

export class NotificationTemplateCommand<T> extends GetListAPICommand<T> {
  constructor(apiService: ApiService, adapter: IAdapter<T>) {
    super(
      apiService,
      adapter,
      `${environment.userApiUrl}/notifications-listing`,
    );
  }
}
