import {GetAPICommand} from '@vmsl/core/api/commands';
import {ApiService} from '@vmsl/core/api/api.service';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {environment} from '@vmsl/env/environment';

export class VerifyLinkCommand<T> extends GetAPICommand<T> {
  constructor(apiService: ApiService, adapter: IAdapter<T>, token) {
    super(apiService, adapter, `${environment.authApiUrl}/auth/user/${token}`);
  }
}
