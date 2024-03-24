import {GetListAPICommand} from '@vmsl/core/core.module';
import {environment} from '@vmsl/env/environment';
import {ApiService} from '@vmsl/core/api/api.service';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';

export class GetPresetQuestionCommand<T> extends GetListAPICommand<T> {
  constructor(apiService: ApiService, adapter: IAdapter<T>) {
    super(apiService, adapter, `${environment.userApiUrl}/mod-call-questions`);
  }
}
