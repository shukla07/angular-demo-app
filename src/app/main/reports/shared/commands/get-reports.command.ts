import {GetListAPICommand} from '@vmsl/core/core.module';
import {ApiService} from '@vmsl/core/api/api.service';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {environment} from '@vmsl/env/environment';

export class GetReportsCommand<t> extends GetListAPICommand<t> {
  constructor(apiService: ApiService, adapter: IAdapter<t>, tenantId) {
    super(
      apiService,
      adapter,
      `${environment.userApiUrl}/tenants/${tenantId}/reports`,
    );
  }
}
