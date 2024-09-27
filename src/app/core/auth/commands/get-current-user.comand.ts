import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {ApiService} from '@vmsl/core/api/api.service';
import {GetAPICommand} from '@vmsl/core/api/commands/get-api.command';
import {environment} from '@vmsl/env/environment';

export class GetCurrentUserCommand<T> extends GetAPICommand<T> {
  constructor(apiService: ApiService, adapter: IAdapter<T>) {
    super(apiService, adapter, `${environment.authApiUrl}/auth/me`);
  }
}
