import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {ApiService} from '@vmsl/core/api/api.service';
import {GetAPICommand} from '@vmsl/core/api/commands';
import {environment} from '@vmsl/env/environment';

export class GetTenantIdForSSOCommand<t> extends GetAPICommand<t> {
  constructor(apiService: ApiService, adapter: IAdapter<t>) {
    super(apiService, adapter, `${environment.authApiUrl}/tenant-landing-page`);
  }
}
