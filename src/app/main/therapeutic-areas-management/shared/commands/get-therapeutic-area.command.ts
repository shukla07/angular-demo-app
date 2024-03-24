import {GetAPICommand} from '@vmsl/core/core.module';
import {environment} from '@vmsl/env/environment';
import {ApiService} from '@vmsl/core/api/api.service';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';

export class GetTherapeuticAreaCommand<T> extends GetAPICommand<T> {
  constructor(
    apiService: ApiService,
    adapter: IAdapter<T>,
    tenantId,
    therapeuticAreaId,
  ) {
    super(
      apiService,
      adapter,
      `${environment.userApiUrl}/tenants/${tenantId}/therapeutic-areas/${therapeuticAreaId}`,
    );
  }
}
