import { GetAPICommand } from '@vmsl/core/core.module';
import { ApiService } from '@vmsl/core/api/api.service';
import { IAdapter } from '@vmsl/core/api/adapters/i-adapter';
import { environment } from '@vmsl/env/environment';

export class GetUserVisibility<T> extends GetAPICommand<T> {
    constructor(apiService: ApiService, adapter: IAdapter<T>, tenantId) {
      super(
        apiService,
        adapter,
        `${environment.userApiUrl}/tenants/${tenantId}/users/user-status`,
      );
    }
  }


