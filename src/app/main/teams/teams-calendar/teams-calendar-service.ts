import { Injectable } from '@angular/core';
import { ApiService } from '@vmsl/core/api/api.service';
import { UserSessionStoreService } from '@vmsl/core/store/user-session-store.service';
import { Observable } from 'rxjs';
import { UserInfo, SchedulerEvent } from '@sourcefuse/ngx-scheduler/lib/types';
import { GetTeamsByIdCommand } from '@vmsl/shared/commands/get-teams-by-id.command';
import { GetTeamEventsAdapter } from './adapters/get-team-events-adapter.service';
import { GetTeamEventsById } from './commands/get-team-events-by-id.command';
import { GetTeamMembersAdapter } from './adapters/get-team-members-adapter.service';
import { GetTeamEvents } from './commands/get-team-events.command';
import { HttpParams } from '@angular/common/http';
import { GetTeamsOwnerList } from './commands/get-teams-owner-list.command';
import { GetAddressBookUserAdapter } from '../../calendar/adapters/get-addressbook-user-adapter.service';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class TeamsCalendarService {
  constructor(
    private readonly apiService: ApiService,
    private readonly store: UserSessionStoreService,
    private readonly getTeamEventsAdapter: GetTeamEventsAdapter,
    private readonly getTeamMembersAdapter: GetTeamMembersAdapter,
    private readonly userAdapter: GetAddressBookUserAdapter,
  ) { }

  getTeamEvents() {
    const command: GetTeamEvents<SchedulerEvent> = new GetTeamEvents(
      this.apiService,
      this.getTeamEventsAdapter,
      this.store.getUser().tenantId,
    );

    return command.execute();
  }

  getTeamEventsById(teamId: string, filters) {
    const command: GetTeamEventsById<SchedulerEvent> = new GetTeamEventsById(
      this.apiService,
      this.getTeamEventsAdapter,
      this.store.getUser().tenantId,
      teamId,
    );

    let params = new HttpParams();
    const query = {};
    if (filters.startTime) {
      query['startTime'] = filters.startTime;
    }

    if (filters.endTime) {
      query['endTime'] = filters.endTime;
    }

    if (filters.assignedToList?.length) {
      query['assignedTo '] = filters.assignedToList;
    }

    if (filters.queueStatusList) {
      query['queueStatus'] = filters.queueStatusList;
    }

    params = params.set('filter', JSON.stringify(query)).set('timezone', moment.tz.guess());

    command.parameters = {
      query: params,
    };

    return command.execute();
  }

  getTeamMembers(id: string): Observable<UserInfo[]> {
    const command: GetTeamsByIdCommand<UserInfo[]> = new GetTeamsByIdCommand(
      this.apiService,
      this.getTeamMembersAdapter,
      this.store.getUser().tenantId,
      id,
    );

    return command.execute();
  }

  getOwners(teamId): Observable<UserInfo[]> {
    const command: GetTeamsOwnerList<UserInfo> = new GetTeamsOwnerList(
      this.apiService,
      this.userAdapter,
      this.store.getUser().tenantId,
      teamId,
    );

    return command.execute();
  }
}
