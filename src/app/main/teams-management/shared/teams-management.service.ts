import {Injectable} from '@angular/core';
import {GetTeamsListCommand} from './commands/get-teamslist.command';
import {Observable, BehaviorSubject} from 'rxjs';
import {ApiService} from '@vmsl/core/api/api.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {TeamsListAdapter} from './adapters/teams-list-adapter.service';
import {TeamInfo} from './models/team-info.model';
import {GetTeamsCountCommand} from './commands/get-teams-count.command';
import {AnyAdapter} from '@vmsl/core/api/adapters/any-adapter.service';
import {HttpParams} from '@angular/common/http';
import {DeleteTeamCommand} from './commands/delete-team.command';
import {GetTeamCommand} from './commands/get-team.command';
import {EditTeamCommand} from './commands/edit-team.command';
import {UpdateTeamsStatusCommand} from './commands/update-teams-status.command';
import {ExportTeamsCsvCommand} from './commands/export-teams-csv.command';
import {teamExportColumns} from './team-export-columns';
import {AddEditTeamAdapter} from '../../../shared/adapters/add-edit-team-adapter.service';
import {AddTeamCommand} from './commands/add-team-command';

@Injectable()
export class TeamsManagementService {
  tenantId: string;
  private readonly teamStatus = new BehaviorSubject<Object>(null);
  teamStatusObv = this.teamStatus.asObservable();

  private readonly teamDelete = new BehaviorSubject<Object>(null);
  teamDeleteObv = this.teamDelete.asObservable();

  private readonly teamsSort = new BehaviorSubject<Object>(null);
  teamsSortObv = this.teamsSort.asObservable();

  constructor(
    private readonly apiService: ApiService,
    private readonly store: UserSessionStoreService,
    private readonly teamsListAdapter: TeamsListAdapter,
    private readonly anyAdapter: AnyAdapter,
    private readonly addEditTeamAdapter: AddEditTeamAdapter,
  ) {
    this.tenantId = this.store.getUser().tenantId;
  }

  getFilteredTeamsList(
    pageNo,
    itemsPerPage,
    filterData,
    sortOrder,
  ): Observable<TeamInfo[]> {
    const command: GetTeamsListCommand<TeamInfo> = new GetTeamsListCommand(
      this.apiService,
      this.teamsListAdapter,
      this.tenantId,
    );
    var params: HttpParams;
    params = this.getQueryParamForTeamsList(
      pageNo,
      itemsPerPage,
      filterData,
      null,
      sortOrder,
    );
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getTeamsCount(filterData): Observable<number> {
    const command: GetTeamsCountCommand<number> = new GetTeamsCountCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    var params: HttpParams;
    params = this.getQueryParamForTeamsList(null, null, filterData);
    command.parameters = {
      observe: 'body',
      query: params,
    };

    return command.execute();
  }

  exportTeamList(filterData, sortOrder, exportType) {
    const command: ExportTeamsCsvCommand<string> = new ExportTeamsCsvCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
      exportType,
    );
    var params: HttpParams;
    params = this.getQueryParamForTeamsList(
      null,
      null,
      filterData,
      true,
      sortOrder,
    );
    command.parameters = {
      observe: 'body',
      query: params,
    };
    return command.execute();
  }

  getQueryParamForTeamsList(
    pageNo,
    itemsPerPage,
    filterData,
    csv = false,
    sortOrder?,
  ) {
    //for filtering data
    const userFilterId = [];
    const whereClause = {
      and: [],
    };

    if (filterData.teamId && filterData.teamId.length > 0) {
      if (filterData.teamId.constructor === String) {
        userFilterId.push(filterData.teamId);
      } else {
        filterData.teamId.forEach(id => {
          userFilterId.push(id);
        });
      }
      whereClause.and.push({id: {inq: userFilterId}});
    }

    //for pagination.
    const queryData = {};
    if (pageNo && itemsPerPage) {
      const skipCount = (pageNo - 1) * itemsPerPage;
      queryData['limit'] = itemsPerPage;
      queryData['skip'] = skipCount;
      queryData['order'] = 'createdOn DESC';
    }

    //for sorting.
    if (sortOrder && sortOrder.length > 0) {
      queryData['order'] = sortOrder;
    }

    //for CSV
    if (csv) {
      queryData['fields'] = teamExportColumns;
    }

    //set query params
    let params = new HttpParams();
    if (Object.keys(queryData).length > 0) {
      if (whereClause.and.length > 0) {
        queryData['where'] = whereClause;
      }
      params = params.set('filter', JSON.stringify(queryData));
    } else {
      params = params.set('where', JSON.stringify(whereClause));
    }
    return params;
  }

  deleteTeam(teamId): Observable<Object> {
    const command: DeleteTeamCommand<Object> = new DeleteTeamCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
      teamId,
    );
    command.parameters = {
      observe: 'body',
    };
    return command.execute();
  }

  getTeamsList() {
    const command: GetTeamsListCommand<TeamInfo> = new GetTeamsListCommand(
      this.apiService,
      this.teamsListAdapter,
      this.tenantId,
    );
    const queryData = {};
    queryData['fields'] = {teamName: true, id: true};
    let params = new HttpParams();
    params = params.set('filter', JSON.stringify(queryData));
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getTeamById(teamId): Observable<TeamInfo> {
    const command: GetTeamCommand<TeamInfo> = new GetTeamCommand(
      this.apiService,
      this.addEditTeamAdapter,
      this.tenantId,
      teamId,
    );
    return command.execute();
  }

  addTeam(team: TeamInfo): Observable<TeamInfo> {
    const command: AddTeamCommand<TeamInfo> = new AddTeamCommand(
      this.apiService,
      this.addEditTeamAdapter,
      this.tenantId,
    );
    command.parameters = {
      data: team,
    };
    return command.execute();
  }

  editTeam(data: TeamInfo, teamId: string): Observable<TeamInfo> {
    const command: EditTeamCommand<TeamInfo> = new EditTeamCommand(
      this.apiService,
      this.addEditTeamAdapter,
      this.tenantId,
      teamId,
    );
    command.parameters = {
      data: data,
    };
    return command.execute();
  }

  updateBulkTeamStatus(teamData: Object): Observable<Object> {
    const command: UpdateTeamsStatusCommand<Object> = new UpdateTeamsStatusCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    command.parameters = {
      data: teamData,
    };
    return command.execute();
  }

  setTeamStatus(data: Object) {
    this.teamStatus.next(data);
  }

  setTeamToBeDeleted(data: Object) {
    this.teamDelete.next(data);
  }

  setTeamsListSort(data: Object) {
    this.teamsSort.next(data);
  }
}
