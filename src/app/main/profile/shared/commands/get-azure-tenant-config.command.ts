import {GetAPICommand} from '@vmsl/core/core.module';
import {ApiService} from '@vmsl/core/api/api.service';
import {environment} from '@vmsl/env/environment';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';

export class GetAzureTenantConfigCommand<T> extends GetAPICommand<T> {
  constructor(apiService: ApiService, adapter: IAdapter<T>, tenantId) {
    super(
      apiService,
      adapter,
      `${environment.userApiUrl}/tenants/${tenantId}/cal-sync/azure-tenant-config`,
    );
  }
}
