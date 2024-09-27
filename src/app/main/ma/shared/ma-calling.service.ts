import {Injectable} from '@angular/core';
import {ApiService} from '@vmsl/core/api/api.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {Observable} from 'rxjs';
import {MALink} from '../ma-link/ma-link.model';
import {MaCallAdapter} from './adapters/ma-call-adapter.service';
import {MaSearchAdapter} from './adapters/ma-search-adapter.service';
import {DisconnectMissMaCallCommand} from './commands/disconnect-missd-ma-call.command';
import {MaSearchCommand} from './commands/ma-search.command';
import {MakeMaCallCommand} from './commands/make-ma-call.command';
import {MaCallActionAdapter} from './adapters/ma-call-action-adapter.service';
import {PickMaCallCommand} from './commands/pick-ma-call.command';
import {PickMaCallAdapter} from './adapters/ma-pick-call-adapter.service';
import {GetPresetQuestionCommand} from './commands/get-preset-question.command';
import {Call} from '../../audio-video/shared/models/call.model';
import {UserInfo} from '@vmsl/core/auth/models/user.model';
import {GetAllUsers} from './commands/get-all-users.command';
import {MissedMaCall} from './commands/missed-call.command';
import {AllUserAdapter} from './adapters/all-user-adapter.service';
import {GetAllTeams} from './commands/get-all-teams.command';
import {TeamInfo} from '../../teams-management/shared/models/team-info.model';
import {AddEditTeamAdapter} from '@vmsl/shared/adapters/add-edit-team-adapter.service';

@Injectable()
export class MaCallingService {
  constructor(
    private readonly apiService: ApiService,
    private readonly store: UserSessionStoreService,
    private readonly maSearchAdapter: MaSearchAdapter,
    private readonly maCallAdapter: MaCallAdapter,
    private readonly maCallActionAdapter: MaCallActionAdapter,
    private readonly pickMaCallAdapter: PickMaCallAdapter,
    private readonly allUserAdapter: AllUserAdapter,
    private readonly addEditTeamsAdapter: AddEditTeamAdapter,
  ) {}

  maSearch(data): Observable<MALink> {
    const command: MaSearchCommand<MALink> = new MaSearchCommand(
      this.apiService,
      this.maSearchAdapter,
      this.store.getUser().tenantId,
    );
    command.parameters = {
      data,
    };

    return command.execute();
  }

  makeCall(data: MALink) {
    const command: MakeMaCallCommand<MALink> = new MakeMaCallCommand(
      this.apiService,
      this.maCallAdapter,
      this.store.getUser().tenantId,
    );

    command.parameters = {
      data,
    };

    return command.execute();
  }

  disconnectMissedCall(action: string, data: MALink) {
    const command: DisconnectMissMaCallCommand<MALink> = new DisconnectMissMaCallCommand(
      this.apiService,
      this.maCallActionAdapter,
      this.store.getUser().tenantId,
      action,
    );

    command.parameters = {
      data,
    };

    return command.execute();
  }

  pickCall(data): Observable<Call> {
    const command: PickMaCallCommand<MALink> = new PickMaCallCommand(
      this.apiService,
      this.pickMaCallAdapter,
      this.store.getUser().tenantId,
    );

    command.parameters = {
      data,
    };
    return command.execute();
  }

  getPresetQuestion(): Observable<Object[]> {
    const command: GetPresetQuestionCommand<Object> = new GetPresetQuestionCommand(
      this.apiService,
      this.pickMaCallAdapter,
    );

    return command.execute();
  }

  getAllUsers(): Observable<UserInfo[]> {
    const command: GetAllUsers<UserInfo> = new GetAllUsers(
      this.apiService,
      this.allUserAdapter,
      this.store.getUser().tenantId,
    );

    return command.execute();
  }

  getAllTeams(): Observable<TeamInfo[]> {
    const command: GetAllTeams<TeamInfo> = new GetAllTeams(
      this.apiService,
      this.addEditTeamsAdapter,
      this.store.getUser().tenantId,
    );

    return command.execute();
  }

  missedCall(data) {
    const command: MissedMaCall<UserInfo> = new MissedMaCall(
      this.apiService,
      this.pickMaCallAdapter,
      this.store.getUser().tenantId,
      this.store.getUser().id,
    );
    command.parameters = {
      data,
    };
    return command.execute();
  }
}
