import {PostAPICommand} from '@vmsl/core/api/commands';
import {ApiService} from '@vmsl/core/api/api.service';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {environment} from '@vmsl/env/environment';

export class RequestOtpCommand<T> extends PostAPICommand<T> {
  constructor(apiService: ApiService, adapter: IAdapter<T>) {
    super(apiService, adapter, `${environment.authApiUrl}/auth/otp`);
  }
}
