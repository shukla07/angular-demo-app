
import { environment } from '@vmsl/env/environment';
import { PatchAPICommand } from '@vmsl/core/core.module';
import { ApiService } from '@vmsl/core/api/api.service';
import { IAdapter } from '@vmsl/core/api/adapters/i-adapter';

export class UnMarkUserFavouriteCommand<T> extends PatchAPICommand<T> {
    constructor(apiService: ApiService, adapter: IAdapter<T>, tenantId) {
      super(
        apiService,
        adapter,
        `${environment.userApiUrl}/tenants/${tenantId}/users/unMark-favourite`,
      );
    }
  }

