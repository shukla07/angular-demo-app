import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {ApiService} from '@vmsl/core/api/api.service';
import {GetAPICommand} from '@vmsl/core/core.module';
import {environment} from '@vmsl/env/environment';

export class ExportModReportsCommand<t> extends GetAPICommand<t> {
  constructor(
    apiService: ApiService,
    adapter: IAdapter<t>,
    tenantId,
  ) {
    super(
      apiService,
      adapter,
      `${environment.userApiUrl}/tenants/${tenantId}/reports/mod/export/CSV`,
    );
  }
}
