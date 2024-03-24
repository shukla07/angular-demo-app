import {GetListAPICommand} from '@vmsl/core/core.module';
import {ApiService} from '@vmsl/core/api/api.service';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {environment} from '@vmsl/env/environment';

export class GetTeamsQueueCommand<T> extends GetListAPICommand<T> {
  constructor(apiService: ApiService, adapter: IAdapter<T>, tenantId, teamId) {
    super(
      apiService,
      adapter,
      `${environment.userApiUrl}/tenants/${tenantId}/teams/${teamId}/queues`,
    );
  }
}
