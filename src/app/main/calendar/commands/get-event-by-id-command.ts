import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {ApiService} from '@vmsl/core/api/api.service';
import {GetAPICommand} from '@vmsl/core/core.module';
import {environment} from '@vmsl/env/environment';

export class GetEventByIdCommand<T> extends GetAPICommand<T> {
  constructor(
    apiService: ApiService,
    adapter: IAdapter<T>,
    tenantId: string,
    eventId,
  ) {
    super(
      apiService,
      adapter,
      `${environment.userApiUrl}/tenants/${tenantId}/events/${eventId}`,
    );
  }
}
