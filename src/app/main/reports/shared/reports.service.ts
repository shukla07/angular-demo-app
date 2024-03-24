import { Injectable } from '@angular/core';
import { ApiService } from '@vmsl/core/api/api.service';
import { AnyAdapter } from '@vmsl/core/api/adapters/any-adapter.service';
import { UserSessionStoreService } from '@vmsl/core/store/user-session-store.service';
import { Report } from './models/report-model';
import { Observable, BehaviorSubject } from 'rxjs';
import { GetReportsCommand } from './commands/get-reports.command';
import { HttpParams } from '@angular/common/http';
import { GetReportCountCommand } from './commands/get-reports-count.command';
import { ReportListAdapter } from './adapters/get-report-list-adapter.service';
import { GetTeamsListCommand } from '../../teams-management/shared/commands/get-teamslist.command';
import { TeamsListAdapter } from '../../teams-management/shared/adapters/teams-list-adapter.service';
import { TeamInfo } from '../../teams-management/shared/models/team-info.model';
import { GetUserCommand } from '../../user/shared/commands/get-user.command';
import { UserInfo } from '@vmsl/core/auth/models/user.model';
import { GetTeamsMissedCallReportsCommand } from './commands/get-teams-missedcall-reports.command';
import { GetTeamsMissedCallReportsCountCommand } from './commands/get-teams-missedcalls-reports-count.command';
import { ExportListConferenceCommand } from './commands/export-conference-list.command';
import { ExportMissedCallListCommand } from './commands/export-missed-call-list.command';
import { ExportNoShowListCommand } from './commands/export-no-show-list.command';
import { TeamsMissedCallsReportListAdapter } from './adapters/get-teams-missedcalls-reports-adapter.service';
import { GetNoShowReportsCommand } from './commands/get-noshow-reports.command';
import { NoShowReport } from './models/noshow-report-model';
import { NoShowReportListAdapter } from './adapters/get-noshow-report-list-adapter.service';
import { GetLinkedUserAdapter } from '@vmsl/shared/adapters/get-linked-users-adapter.service';
import { GetModReportsCommand } from './commands/get-mod-reports.command';
import { GetNoShowReportsCountCommand } from './commands/get-noshow-reports-count.command';
import { GetModReportsCountCommand } from './commands/get-mod-reports-count.command';
import { ExportModReportsCommand } from './commands/export-mod-reports.command';
import { ModReports, ModMetric } from './models/mod-reports-model';
import { ModReportListAdapter } from './adapters/get-mod-report-list-adapter.service';
import * as moment from 'moment';
import { GetModMetricReportCommand } from './commands/get-mod-metric-report.command';
import { ModMetricReportListAdapter } from './adapters/get-mod-metric-report-list-adapter.service';

@Injectable()
export class ReportsService {
  tenantId: string;

  private readonly viewReport = new BehaviorSubject<object>(null);
  viewReportObv = this.viewReport.asObservable();

  private readonly viewModReport = new BehaviorSubject<object>(null);
  viewModReportObv = this.viewModReport.asObservable();

  private readonly viewNoShowEvents = new BehaviorSubject<object[]>(null);
  viewNoShowEventsObv = this.viewNoShowEvents.asObservable();

  private readonly viewRequestedUsers = new BehaviorSubject<object[]>(null);
  viewRequestedUsersObv = this.viewRequestedUsers.asObservable();

  private readonly allMeetingsSort = new BehaviorSubject<object>(null);
  allMeetingsSortObv = this.allMeetingsSort.asObservable();

  private readonly noShowMeetingsSort = new BehaviorSubject<object>(null);
  noShowMeetingsSortObv = this.noShowMeetingsSort.asObservable();

  private readonly missedTeamMeetingsSort = new BehaviorSubject<object>(null);
  missedTeamMeetingsSortObv = this.missedTeamMeetingsSort.asObservable();

  private readonly modReportsSort = new BehaviorSubject<object>(null);
  modReportsSortObv = this.modReportsSort.asObservable();

  constructor(
    private readonly apiService: ApiService,
    private readonly anyAdapter: AnyAdapter,
    private readonly store: UserSessionStoreService,
    private readonly reportListAdapter: ReportListAdapter,
    private readonly teamsListAdapter: TeamsListAdapter,
    private readonly getLinkedUserAdapter: GetLinkedUserAdapter,
    private readonly teamMissedCallReportAdapter: TeamsMissedCallsReportListAdapter,
    private readonly noShowReportsAdapter: NoShowReportListAdapter,
    private readonly modReportsAdapter: ModReportListAdapter,
    private readonly modMetricReportListAdapter: ModMetricReportListAdapter,
  ) {
    this.tenantId = this.store.getUser().tenantId;
  }

  getReports(
    pageNo,
    itemsPerPage,
    filterData,
    orderFilter,
  ): Observable<Report[]> {
    const command: GetReportsCommand<Report> = new GetReportsCommand(
      this.apiService,
      this.reportListAdapter,
      this.tenantId,
    );

    var params: HttpParams;
    params = this.getQueryParamForReportList(
      pageNo,
      itemsPerPage,
      false,
      filterData,
      orderFilter,
    );

    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getTeamsMissedCallReports(
    pageNo,
    itemsPerPage,
    filterData,
    sortOrder,
  ): Observable<Report[]> {
    const command: GetTeamsMissedCallReportsCommand<Report> =
      new GetTeamsMissedCallReportsCommand(
        this.apiService,
        this.teamMissedCallReportAdapter,
        this.tenantId,
      );

    var params: HttpParams;
    params = this.getQueryParamForReportList(
      pageNo,
      itemsPerPage,
      false,
      filterData,
      sortOrder,
    );

    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  exportConferenceList(filterData, exportType: string, orderFilter) {
    const command: ExportListConferenceCommand<string> =
      new ExportListConferenceCommand(
        this.apiService,
        this.anyAdapter,
        this.tenantId,
        exportType,
      );

    const params = this.getQueryParamForReportList(
      null,
      null,
      true,
      filterData,
      orderFilter,
    );

    command.parameters = {
      observe: 'body',
      query: params,
    };

    return command.execute();
  }

  exportMissedCallList(filterData, exportType: string, orderFilter) {
    const command: ExportMissedCallListCommand<string> =
      new ExportMissedCallListCommand(
        this.apiService,
        this.anyAdapter,
        this.tenantId,
        exportType,
      );

    const params = this.getQueryParamForReportList(
      null,
      null,
      true,
      filterData,
      orderFilter,
    );

    command.parameters = {
      observe: 'body',
      query: params,
    };

    return command.execute();
  }

  exportNoShowList(filterData, exportType: string, orderFilter) {
    const command: ExportNoShowListCommand<string> =
      new ExportNoShowListCommand(
        this.apiService,
        this.anyAdapter,
        this.tenantId,
        exportType,
      );

    const params = this.getQueryParamForReportList(
      null,
      null,
      true,
      filterData,
      orderFilter,
    );

    command.parameters = {
      observe: 'body',
      query: params,
    };

    return command.execute();
  }

  getTeamsMissedCallReportsCount(filterData): Observable<number> {
    const command: GetTeamsMissedCallReportsCountCommand<number> =
      new GetTeamsMissedCallReportsCountCommand(
        this.apiService,
        this.anyAdapter,
        this.tenantId,
      );
    const queryData = {};

    var params: HttpParams;
    params = this.getQueryParamForReportList(null, null, false, filterData);
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getNoShowReports(
    pageNo,
    itemsPerPage,
    filterData,
    orderFilter,
  ): Observable<NoShowReport[]> {
    const command: GetNoShowReportsCommand<NoShowReport> =
      new GetNoShowReportsCommand(
        this.apiService,
        this.noShowReportsAdapter,
        this.tenantId,
      );

    var params: HttpParams;
    params = this.getQueryParamForReportList(
      pageNo,
      itemsPerPage,
      false,
      filterData,
      orderFilter,
    );

    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getNoShowReportsCount(filterData): Observable<number> {
    const command: GetNoShowReportsCountCommand<number> =
      new GetNoShowReportsCountCommand(
        this.apiService,
        this.anyAdapter,
        this.tenantId,
      );
    const queryData = {};

    var params: HttpParams;
    params = this.getQueryParamForReportList(null, null, false, filterData);
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getReportsCount(filterData): Observable<number> {
    const command: GetReportCountCommand<number> = new GetReportCountCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );

    var params: HttpParams;
    params = this.getQueryParamForReportList(null, null, false, filterData);
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getModReportsList(
    pageNo,
    itemsPerPage,
    filterData,
    orderFilter,
    allRequestors?,
  ): Observable<ModReports[]> {
    const command: GetModReportsCommand<ModReports> = new GetModReportsCommand(
      this.apiService,
      this.modReportsAdapter,
      this.tenantId,
    );

    var params: HttpParams;
    params = this.getQueryParamForModReportList(
      pageNo,
      itemsPerPage,
      false,
      filterData,
      orderFilter,
      allRequestors,
    );
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getModMetricReportList(
    pageNo,
    itemsPerPage,
    filterData,
    orderFilter,
    allRequestors?,
  ): Observable<ModMetric[]> {
    const command: GetModMetricReportCommand<ModMetric> =
      new GetModMetricReportCommand(
        this.apiService,
        this.modMetricReportListAdapter,
        this.tenantId,
      );

    var params: HttpParams;
    params = this.getQueryParamForModReportList(
      pageNo,
      itemsPerPage,
      false,
      filterData,
      orderFilter,
      allRequestors,
    );
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getModReportsCount(filterData): Observable<number> {
    const command: GetModReportsCountCommand<number> =
      new GetModReportsCountCommand(
        this.apiService,
        this.anyAdapter,
        this.tenantId,
      );
    var params: HttpParams;
    params = this.getQueryParamForModReportList(null, null, false, filterData);
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  exportModReports(filterData, sortOrder, allRequestors) {
    const command: ExportModReportsCommand<string> =
      new ExportModReportsCommand(
        this.apiService,
        this.anyAdapter,
        this.tenantId,
      );

    const params = this.getQueryParamForModReportList(
      null,
      null,
      true,
      filterData,
      sortOrder,
      allRequestors,
    );

    command.parameters = {
      observe: 'body',
      query: params,
    };

    return command.execute();
  }

  getQueryParamForReportList(
    pageNo,
    itemsPerPage,
    csv,
    filterData?,
    sortOrder?,
  ) {
    const queryData = {};
    //for filtering
    if (filterData.userId) {
      queryData['userId'] = filterData.userId;
    }
    if (filterData.teamId) {
      queryData['teamId'] = filterData.teamId;
    }
    if (filterData.userRole) {
      queryData['userRoleName'] = filterData.userRole;
    }
    if (filterData.callType) {
      queryData['callType'] = filterData.callType;
    }
    if (filterData.eventType) {
      queryData['eventType'] = filterData.eventType;
    }
    if (filterData.fromDate) {
      queryData['fromDate'] = filterData.fromDate;
    }
    if (filterData.tillDate) {
      queryData['tillDate'] = filterData.tillDate;
    }
    if (filterData.status) {
      queryData['status'] = filterData.status;
    }
    if (sortOrder) {
      queryData['sort'] = sortOrder;
    }
    if (filterData.createdBy) {
      queryData['createdByName'] = filterData.createdBy;
    }
    if (filterData.organizer) {
      queryData['organizer'] = filterData.organizer;
    }
    if (csv) {
      queryData['timezone'] = moment.tz.guess();
    }

    //for pagination
    if (itemsPerPage) {
      const skipCount = (pageNo - 1) * itemsPerPage;
      queryData['limit'] = itemsPerPage;
      queryData['skip'] = skipCount;
    }

    let params = new HttpParams();
    params = params.set('filter', JSON.stringify(queryData));
    return params;
  }

  getQueryParamForModReportList(
    pageNo,
    itemsPerPage,
    csv,
    filterData?,
    sortOrder?,
    allRequestors?,
  ) {
    const parentQuery = { where: { and: [] } };

    //pagination and skip
    if (pageNo && itemsPerPage) {
      const skipCount = (pageNo - 1) * itemsPerPage;
      parentQuery['limit'] = itemsPerPage;
      parentQuery['skip'] = skipCount;
      parentQuery['order'] = 'requestSentDate DESC';
    }

    //filters
    this.filterUsersForModReports(filterData, parentQuery, allRequestors);
    this.getAndClauseForModReports(filterData, parentQuery);
    if (filterData.fromDate) {
      parentQuery.where.and.push({
        requestSentDate: { between: [filterData.fromDate, filterData.tillDate] },
      });
    }

    //sort
    if (sortOrder && sortOrder.length > 0) {
      parentQuery['order'] = sortOrder;
    } else {
      parentQuery['order'] = 'requestSentDate DESC';
    }

    let params = new HttpParams();
    if (csv) {
      params = params
        .set('filter', JSON.stringify(parentQuery))
        .set('timezone', moment.tz.guess());
    } else {
      params = params.set('filter', JSON.stringify(parentQuery));
    }
    return params;
  }

  filterUsersForModReports(filterData, parentClause, allRequestors) {
    if (allRequestors && allRequestors.length) {
      filterData.requestorId = allRequestors;
    }
    if (filterData.requestorId && filterData.requestorId.length) {
      parentClause.where.and.push({
        requestorId: { inq: filterData.requestorId },
      });
    }
    if (filterData.hcpOrPayor) {
      parentClause.where.and.push({
        hcpOrPayorName: { ilike: `%${filterData.hcpOrPayor}%` },
      });
    }
  }

  getAndClauseForModReports(filterData, parentClause) {
    if (filterData.territories && filterData.territories.length) {
      const territoryOrClause = { or: [] };
      filterData.territories.forEach(territory => {
        territoryOrClause.or.push({
          territory: {
            ilike: `%${territory},%`,
          },
        });
      });
      parentClause.where.and.push(territoryOrClause);
    }
    if (filterData.therapeuticAreas && filterData.therapeuticAreas.length) {
      const therapeuticAreaOrClause = { or: [] };
      filterData.therapeuticAreas.forEach(therapeuticArea => {
        therapeuticAreaOrClause.or.push({
          therapeuticArea: {
            ilike: `%${therapeuticArea},%`,
          },
        });
      });
      parentClause.where.and.push(therapeuticAreaOrClause);
    }
    if (filterData.diseaseAreas && filterData.diseaseAreas.length) {
      const diseaseAreaOrClause = { or: [] };
      filterData.diseaseAreas.forEach(diseaseArea => {
        diseaseAreaOrClause.or.push({
          diseaseArea: {
            ilike: `%${diseaseArea},%`,
          },
        });
      });
      parentClause.where.and.push(diseaseAreaOrClause);
    }
    if (filterData.teams && filterData.teams.length) {
      const teamsOrClause = { or: [] };
      filterData.teams.forEach(team => {
        teamsOrClause.or.push({
          requestedTeams: {
            ilike: `%${team},%`,
          },
        });
      });
      parentClause.where.and.push(teamsOrClause);
    }
    if (filterData.jobTitles && filterData.jobTitles.length) {
      const jobTitleOrClause = { or: [] };
      filterData.jobTitles.forEach(jobTitle => {
        jobTitleOrClause.or.push({
          jobTitle: {
            ilike: `%${jobTitle},%`,
          },
        });
      });
      parentClause.where.and.push(jobTitleOrClause);
    }

    if (filterData.callStatus) {
      const callStatusOrClause = { or: [] };
      callStatusOrClause.or.push({
        status: { ilike: `%${filterData.callStatus}%` },
      });
      if (filterData.callStatus === 'PickedCall') {
        callStatusOrClause.or.push({
          status: { ilike: '%Completed Call%' },
        });
      }
      parentClause.where.and.push(callStatusOrClause);
    }
  }

  getTeamsList() {
    const command: GetTeamsListCommand<TeamInfo> = new GetTeamsListCommand(
      this.apiService,
      this.teamsListAdapter,
      this.tenantId,
    );
    const queryData = {};
    queryData['fields'] = { teamName: true, id: true };
    let params = new HttpParams();
    params = params.set('filter', JSON.stringify(queryData));
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getTeamsEventName(): Observable<Report[]> {
    const command: GetTeamsMissedCallReportsCommand<Report> =
      new GetTeamsMissedCallReportsCommand(
        this.apiService,
        this.teamMissedCallReportAdapter,
        this.tenantId,
      );
    const queryData = {};
    queryData['fields'] = { summary: true, eventId: true };
    let params = new HttpParams();
    params = params.set('filter', JSON.stringify(queryData));
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getLinkedUser(userId): Observable<UserInfo[]> {
    const command: GetUserCommand<UserInfo[]> = new GetUserCommand(
      this.apiService,
      this.getLinkedUserAdapter,
      this.tenantId,
      userId,
    );
    const query = {
      order: 'fullName ASC',
    };
    let params = new HttpParams();
    params = params.set('filter', JSON.stringify(query));
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  setReportInfo(reportData: Object) {
    this.viewReport.next(reportData);
  }

  setModReportsInfo(reportData: Object) {
    this.viewModReport.next(reportData);
  }

  setNoShowEvents(eventData: Object[]) {
    this.viewNoShowEvents.next(eventData);
  }

  setRequestedUsers(requestedUsers: Object[]) {
    this.viewRequestedUsers.next(requestedUsers);
  }

  setAllMeetingstSort(data: object) {
    this.allMeetingsSort.next(data);
  }

  setNoShowMeetingstSort(data: object) {
    this.noShowMeetingsSort.next(data);
  }

  setTeamMissedMeetingstSort(data: object) {
    this.missedTeamMeetingsSort.next(data);
  }

  setModReportsSort(data: Object) {
    this.modReportsSort.next(data);
  }
}
