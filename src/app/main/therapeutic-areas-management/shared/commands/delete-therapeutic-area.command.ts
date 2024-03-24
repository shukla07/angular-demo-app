import {DelAPICommand} from '@vmsl/core/core.module';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {environment} from '@vmsl/env/environment';
import {ApiService} from '@vmsl/core/api/api.service';

export class DeleteTherapeuticAreaCommand<T> extends DelAPICommand<T> {
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
