import {GetAPICommand} from '@vmsl/core/core.module';
import {ApiService} from '@vmsl/core/api/api.service';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {environment} from '@vmsl/env/environment';

export class SwitchOrganisationsCommand<T> extends GetAPICommand<T> {
  constructor(apiService: ApiService, adapter: IAdapter<T>, tenantId: string) {
    super(
      apiService,
      adapter,
      `${environment.authApiUrl}/switchToken/${tenantId}`,
    );
  }
}
