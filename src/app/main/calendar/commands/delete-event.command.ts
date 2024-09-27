import { DelAPICommand } from '@vmsl/core/core.module';
import { ApiService } from '@vmsl/core/api/api.service';
import { IAdapter } from '@vmsl/core/api/adapters/i-adapter';
import { environment } from '@vmsl/env/environment';

export class DeleteEventCommand<T> extends DelAPICommand<T> {
  constructor(apiService: ApiService, adapter: IAdapter<T>, tenantId, eventId) {
    super(
      apiService,
      adapter,
      `${environment.userApiUrl}/tenants/${tenantId}/events/${eventId}`
    );
  }
}
