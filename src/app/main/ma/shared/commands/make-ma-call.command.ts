import {PostAPICommand} from '@vmsl/core/core.module';
import {environment} from '@vmsl/env/environment';
import {ApiService} from '@vmsl/core/api/api.service';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';

export class MakeMaCallCommand<T> extends PostAPICommand<T> {
  constructor(apiService: ApiService, adapter: IAdapter<T>, tenantId: string) {
    super(
      apiService,
      adapter,
      `${environment.userApiUrl}/tenants/${tenantId}/ma-link-bridge/makeCall`,
    );
  }
}
