import {GetListAPICommand} from '@vmsl/core/core.module';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {ApiService} from '@vmsl/core/api/api.service';
import {environment} from '@vmsl/env/environment';

export class GetChatById<T> extends GetListAPICommand<T> {
  constructor(
    apiService: ApiService,
    adapter: IAdapter<T>,
    tenantId,
    channelId,
  ) {
    super(
      apiService,
      adapter,
      `${environment.chatApiUrl}/tenants/${tenantId}/chats/channels/${channelId}`,
    );
  }
}
