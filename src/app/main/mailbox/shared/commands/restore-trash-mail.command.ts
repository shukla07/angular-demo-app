import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {ApiService} from '@vmsl/core/api/api.service';
import {PatchAPICommand} from '@vmsl/core/core.module';
import {environment} from '@vmsl/env/environment';

export class RestoreTrashMailsCommand<T> extends PatchAPICommand<T> {
  constructor(apiService: ApiService, adapter: IAdapter<T>, tenantId) {
    super(
      apiService,
      adapter,
      `${environment.userApiUrl}/tenants/${tenantId}/in-mails/bulk/restore`,
    );
  }
}
