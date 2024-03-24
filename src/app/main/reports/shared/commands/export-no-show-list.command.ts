import {GetAPICommand} from '@vmsl/core/core.module';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {ApiService} from '@vmsl/core/api/api.service';
import {environment} from '@vmsl/env/environment';

export class ExportNoShowListCommand<T> extends GetAPICommand<T> {
  constructor(
    apiService: ApiService,
    adapter: IAdapter<T>,
    tenantId,
    exportType,
  ) {
    super(
      apiService,
      adapter,
      `${environment.userApiUrl}/tenants/${tenantId}/reports/no-shows/export/${exportType}`,
    );
  }
}
