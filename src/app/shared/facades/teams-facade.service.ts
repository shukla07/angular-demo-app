import {Injectable} from '@angular/core';
import {ApiService} from '@vmsl/core/api/api.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {Observable, of} from 'rxjs';
import {TeamInfo} from '../../main/teams-management/shared/models/team-info.model';
import {GetTeamsCommand} from '../commands/get-teams.command';
import {SaveTeamsSettingsCommand} from '../commands/save-teams-settings-command';
import {AddEditTeamAdapter} from '../adapters/add-edit-team-adapter.service';
import {TeamsSettingsAdapter} from '../adapters/team-settings-adapter.service';
import {GetTeamsByIdCommand} from '../commands/get-teams-by-id.command';
import {GetScheduleQueueCommand} from '../commands/get-schedule-queue.command';
import {GetQueueCommand} from '../commands/get-queue.command';
import {TeamQueueAdapter} from '../adapters/queue-adapter.service';
import {GetTeamsQueueCommand} from '../commands/get-teams-queue.command';
import {Queue} from '../model/queue.model';
import {HttpParams} from '@angular/common/http';
import {ScheduleTeamMeetingCommand} from '../commands/schedue-team-meeting.command';
import {ScheduleTeamMeetingAdapter} from '../adapters/schedule-team-meeting-adapter.service';
import {ScheduleQueueAdapter} from '../adapters/schedule-queue-adapter.service';
import {AcceptAssignCommand} from '../commands/accept-assign-team-meeting.command';
import {AnyAdapter} from '@vmsl/core/api/adapters/any-adapter.service';
import {tap} from 'rxjs/operators';
import {SchedulerEvent} from '@sourcefuse/ngx-scheduler/lib/types';

@Injectable()
export class TeamsFacadeService {
  tenantId: string;
  constructor(
    private readonly apiService: ApiService,
    private readonly store: UserSessionStoreService,
    private readonly anyAdapter: AnyAdapter,
    private readonly teamsSettingsAdapter: TeamsSettingsAdapter,
    private readonly addEditTeamsAdapter: AddEditTeamAdapter,
    private readonly teamQueueAdapter: TeamQueueAdapter,
    private readonly scheduleQueueAdapter: ScheduleQueueAdapter,
    private readonly scheduleTeamMeetingAdapter: ScheduleTeamMeetingAdapter,
  ) {
    this.tenantId = this.store.getUser().tenantId;
  }

  getTeams(isHcp = false): Observable<TeamInfo[]> {
    const teams = this.store.getTeams();
    if (teams && teams.length > 0 && !isHcp) {
      return of(teams);
    } else {
      const command: GetTeamsCommand<TeamInfo> = new GetTeamsCommand(
        this.apiService,
        this.addEditTeamsAdapter,
        this.tenantId,
      );
      return command.execute().pipe(
        tap(res => {
          this.store.setTeams(res);
        }),
      );
    }
  }

  saveTeamsSettings(teamData: TeamInfo): Observable<Object> {
    const command: SaveTeamsSettingsCommand<TeamInfo> = new SaveTeamsSettingsCommand(
      this.apiService,
      this.teamsSettingsAdapter,
      this.tenantId,
      teamData.teamId,
    );
    command.parameters = {
      data: teamData,
    };
    return command.execute();
  }

  getTeamById(id: string): Observable<TeamInfo> {
    const command: GetTeamsByIdCommand<TeamInfo> = new GetTeamsByIdCommand(
      this.apiService,
      this.addEditTeamsAdapter,
      this.store.getUser().tenantId,
      id,
    );

    return command.execute();
  }

  scheduleTeamMeeting(data: SchedulerEvent): Observable<SchedulerEvent> {
    const command: ScheduleTeamMeetingCommand<SchedulerEvent> = new ScheduleTeamMeetingCommand(
      this.apiService,
      this.scheduleTeamMeetingAdapter,
      this.store.getUser().tenantId,
      data['teamId'],
    );

    command.parameters = {
      data: data,
    };

    return command.execute();
  }

  getAdhocQueue(): Observable<Queue[]> {
    const command: GetQueueCommand<Queue> = new GetQueueCommand(
      this.apiService,
      this.teamQueueAdapter,
      this.store.getUser().tenantId,
    );
    let params = new HttpParams();
    params = params.set('status', 'queued');

    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getTeamAdhocQueue(teamId: string): Observable<Queue[]> {
    const command: GetTeamsQueueCommand<Queue> = new GetTeamsQueueCommand(
      this.apiService,
      this.teamQueueAdapter,
      this.store.getUser().tenantId,
      teamId,
    );
    let params = new HttpParams();
    params = params.set('status', 'queued');

    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getScheduleQueue(): Observable<Queue[]> {
    const command: GetScheduleQueueCommand<Queue> = new GetScheduleQueueCommand(
      this.apiService,
      this.scheduleQueueAdapter,
      this.store.getUser().tenantId,
    );
    let params = new HttpParams();
    const query = {
      order: 'modifiedOn DESC',
    };
    params = params.set('filter', JSON.stringify(query));

    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getTeamScheduleQueue(teamId: string): Observable<Queue[]> {
    const command: GetScheduleQueueCommand<Queue> = new GetScheduleQueueCommand(
      this.apiService,
      this.scheduleQueueAdapter,
      this.store.getUser().tenantId,
    );
    let params = new HttpParams();
    const query = {
      order: 'modifiedOn DESC',
      where: {
        teamId: {
          inq: [teamId],
        },
      },
    };
    params = params.set('filter', JSON.stringify(query));

    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  acceptAssignTeamMeeting(data: Queue, userId: string) {
    const command: AcceptAssignCommand<object> = new AcceptAssignCommand(
      this.apiService,
      this.anyAdapter,
      this.store.getUser().tenantId,
      data.teamId,
      data.queueId,
      data.eventId,
    );

    command.parameters = {
      data: {identifiers: [userId]},
    };
    return command.execute();
  }
}
