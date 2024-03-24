import { PatchAPICommand } from '@vmsl/core/core.module';
import { ApiService } from '@vmsl/core/api/api.service';
import { IAdapter } from '@vmsl/core/api/adapters/i-adapter';
import { environment } from '@vmsl/env/environment';

export class UpdateRsvpCommand<T> extends PatchAPICommand<T> {
  constructor(
    apiService: ApiService,
    adapter: IAdapter<T>,
    tenantId: string,
    eventId: string,
    attendeeId: string
  ) {
    super(
      apiService,
      adapter,
      `${environment.userApiUrl}/tenants/${tenantId}/events/${eventId}/meeting-response/${attendeeId}`
    );
  }
}
