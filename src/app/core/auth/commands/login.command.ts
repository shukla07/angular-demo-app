import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {ApiService} from '@vmsl/core/api/api.service';
import {PostAPICommand} from '@vmsl/core/api/commands/post-api.command';
import {environment} from '@vmsl/env/environment';

export class LoginCommand<T> extends PostAPICommand<T> {
  constructor(apiService: ApiService, adapter: IAdapter<T>) {
    super(apiService, adapter, `${environment.authApiUrl}/auth/login`);
  }
}
