import {GetAPICommand} from '@vmsl/core/core.module';
import {ApiService} from '@vmsl/core/api/api.service';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {environment} from '@vmsl/env/environment';

export class ExportTerritoriesCommand<T> extends GetAPICommand<T> {
  constructor(apiService: ApiService, adapter: IAdapter<T>, tenantId, expType) {
    super(
      apiService,
      adapter,
      `${environment.userApiUrl}/tenants/${tenantId}/territories/export/${expType}`,
    );
  }
}
