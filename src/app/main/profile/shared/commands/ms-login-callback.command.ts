import {PostAPICommand} from '@vmsl/core/core.module';
import {ApiService} from '@vmsl/core/api/api.service';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {environment} from '@vmsl/env/environment';

export class MSLoginCallback<T> extends PostAPICommand<T> {
  constructor(apiService: ApiService, adapter: IAdapter<T>) {
    super(apiService, adapter, `${environment.authApiUrl}/ms-login/callback`);
  }
}
