import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {ApiService} from '@vmsl/core/api/api.service';
import {GetListAPICommand} from '@vmsl/core/core.module';
import {environment} from '@vmsl/env/environment';

export class GetModMetricReportCommand<t> extends GetListAPICommand<t> {
  constructor(apiService: ApiService, adapter: IAdapter<t>, tenantId) {
    super(
      apiService,
      adapter,
      `${environment.userApiUrl}/tenants/${tenantId}/reports/mod-metric`,
    );
  }
}
