import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {ApiService} from '@vmsl/core/api/api.service';
import {PostAPICommand} from '@vmsl/core/api/commands';
import {environment} from '@vmsl/env/environment';

export class ScheduleTeamMeetingCommand<T> extends PostAPICommand<T> {
  constructor(
    apiService: ApiService,
    adapter: IAdapter<T>,
    tenantId: string,
    teamId: string,
  ) {
    super(
      apiService,
      adapter,
      `${environment.userApiUrl}/tenants/${tenantId}/teams/${teamId}/queues/scheduler`,
    );
  }
}
