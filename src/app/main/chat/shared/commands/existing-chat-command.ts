import {PostAPICommand} from '@vmsl/core/core.module';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {ApiService} from '@vmsl/core/api/api.service';
import {environment} from '@vmsl/env/environment';

export class ExistingChatCommand<T> extends PostAPICommand<T> {
  constructor(apiService: ApiService, adapter: IAdapter<T>, tenantId) {
    super(
      apiService,
      adapter,
      `${environment.chatApiUrl}/tenants/${tenantId}/chats/find`,
    );
  }
}
