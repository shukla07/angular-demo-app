import {DelAPICommand} from '@vmsl/core/core.module';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {environment} from '@vmsl/env/environment';
import {ApiService} from '@vmsl/core/api/api.service';

export class DeleteTeamCommand<T> extends DelAPICommand<T> {
  constructor(apiService: ApiService, adapter: IAdapter<T>, tenantId, teamId) {
    super(
      apiService,
      adapter,
      `${environment.userApiUrl}/tenants/${tenantId}/teams/${teamId}`,
    );
  }
}
