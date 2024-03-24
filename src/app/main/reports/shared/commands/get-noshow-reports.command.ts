import {GetListAPICommand} from '@vmsl/core/core.module';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {ApiService} from '@vmsl/core/api/api.service';
import {environment} from '@vmsl/env/environment';

export class GetNoShowReportsCommand<t> extends GetListAPICommand<t> {
  constructor(apiService: ApiService, adapter: IAdapter<t>, tenantId) {
    super(
      apiService,
      adapter,
      `${environment.userApiUrl}/tenants/${tenantId}/reports/no-shows`,
    );
  }
}
