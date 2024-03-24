import {PatchAPICommand} from '@vmsl/core/core.module';
import {ApiService} from '@vmsl/core/api/api.service';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {environment} from '@vmsl/env/environment';

export class EndTeamAdhocCallCommand<T> extends PatchAPICommand<T> {
  constructor(
    apiService: ApiService,
    adapter: IAdapter<T>,
    tenantId,
    teamId,
    queueId,
  ) {
    super(
      apiService,
      adapter,
      `${environment.userApiUrl}/tenants/${tenantId}/teams/${teamId}/queues/${queueId}`,
    );
  }
}
