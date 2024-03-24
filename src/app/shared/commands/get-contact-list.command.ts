import {GetListAPICommand} from '@vmsl/core/core.module';
import {ApiService} from '@vmsl/core/api/api.service';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {environment} from '@vmsl/env/environment';

export class GetContactList<T> extends GetListAPICommand<T> {
  constructor(
    apiService: ApiService,
    adapter: IAdapter<T>,
    tenantId,
    LoggedinUserId,
  ) {
    super(
      apiService,
      adapter,
      `${environment.userApiUrl}/tenants/${tenantId}/users/${LoggedinUserId}/addressBook`,
    );
  }
}
