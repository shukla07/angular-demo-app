import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {ApiService} from '@vmsl/core/api/api.service';
import {GetAPICommand} from '@vmsl/core/api/commands/get-api.command';
import {environment} from '@vmsl/env/environment';

export class CheckDownHierarchyCommand<T> extends GetAPICommand<T> {
  constructor(
    apiService: ApiService,
    adapter: IAdapter<T>,
    tenantId,
    userId1,
    userId2,
  ) {
    super(
      apiService,
      adapter,
      `${environment.userApiUrl}/tenants/${tenantId}/users/is-down-hierarchy/${userId1}/${userId2}`,
    );
  }
}
