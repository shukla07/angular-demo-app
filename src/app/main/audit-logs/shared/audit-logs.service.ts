import { Injectable } from '@angular/core';
import { ApiService } from '@vmsl/core/api/api.service';
import { UserSessionStoreService } from '@vmsl/core/store/user-session-store.service';
import { GetAuditLogsTypeCommand } from './commands/get-auditlogs-type.command';
import { AnyAdapter } from '@vmsl/core/api/adapters/any-adapter.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { GetAuditLogsCommand } from './commands/get-auditlogs.command';
import { UserInfo } from '@vmsl/core/auth/models/user.model';
import { GetUserListCommand } from '../../user/shared/commands/get-users.command';
import { HttpParams } from '@angular/common/http';
import { GetAuditLogsCountCommand } from './commands/get-auditlogs-count.command';
import { AuditLogsListAdapter } from './adapters/auditlogs-list-adapter.service';
import { AuditLogs } from './models/audit-logs.model';
import { AddUserAdapter } from '@vmsl/shared/adapters/user-adapter.service';
import { GetUserCommand } from '../../user/shared/commands/get-user.command';
import { GetLinkedUserAdapter } from '@vmsl/shared/adapters/get-linked-users-adapter.service';
import { ExportAuditLogsCommand } from './commands/export-auditlogs.command';
import * as moment from 'moment';

@Injectable()
export class AuditLogsService {
  tenantId: string;
  private readonly viewOperator = new BehaviorSubject<string>(null);
  viewOperatorObv = this.viewOperator.asObservable();

  private readonly changesFromLogs = new BehaviorSubject<Object>(null);
  viewLogsChanges = this.changesFromLogs.asObservable();

  private readonly operationTime = new BehaviorSubject<Object>(null);
  operationTimeObv = this.operationTime.asObservable();

  constructor(
    private readonly apiService: ApiService,
    private readonly store: UserSessionStoreService,
    private readonly anyAdapter: AnyAdapter,
    private readonly auditLogsListAdapter: AuditLogsListAdapter,
    private readonly addUserAdapter: AddUserAdapter,
    private readonly getLinkedUserAdapter: GetLinkedUserAdapter,
  ) {
    this.tenantId = this.store.getUser().tenantId;
  }

  getAuditLogs(pageNo, itemsPerPage, filterData): Observable<AuditLogs[]> {
    const command: GetAuditLogsCommand<AuditLogs> = new GetAuditLogsCommand(
      this.apiService,
      this.auditLogsListAdapter,
      this.tenantId,
    );
    filterData.timezone = false;
    var params: HttpParams;
    params = this.getQueryParamForAuditList(pageNo, itemsPerPage, filterData);
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getAuditLogsCount(filter): Observable<number> {
    const command: GetAuditLogsCountCommand<number> = new GetAuditLogsCountCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    filter.timezone = false;
    var params: HttpParams;
    params = this.getQueryParamForAuditList(null, null, filter);
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getAuditLogsType(): Observable<Array<string>> {
    const command: GetAuditLogsTypeCommand<Array<
      string
    >> = new GetAuditLogsTypeCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    return command.execute();
  }

  getUserByTenantId(userTenantId): Observable<UserInfo[]> {
    const command: GetUserListCommand<UserInfo> = new GetUserListCommand(
      this.apiService,
      this.addUserAdapter,
      this.tenantId,
    );

    let params = new HttpParams();
    const q = {
      where: {
        userTenantId: userTenantId,
      },
    };
    params = params.set('filter', JSON.stringify(q));
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getQueryParamForAuditList(pageNo, itemsPerPage, filterData?) {
    const queryData = {};
    //for filtering
    if (filterData.userTenantId) {
      queryData['userid'] = filterData.userTenantId;
    }
    if (filterData.dateFrom) {
      queryData['datefrom'] = filterData.dateFrom;
    }
    if (filterData.dateTo) {
      queryData['dateto'] = filterData.dateTo;
    }
    if (filterData.logType) {
      queryData['logtype'] = filterData.logType;
    }
    if (filterData.timezone) {
      queryData['timezone'] = moment.tz.guess();
    }

    //for pagination
    if (pageNo && itemsPerPage) {
      const skipCount = (pageNo - 1) * itemsPerPage;
      queryData['limit'] = itemsPerPage;
      queryData['skip'] = skipCount;
    }

    let params = new HttpParams();
    params = params.set('filter', JSON.stringify(queryData));
    return params;
  }

  getLinkedUser(userId): Observable<UserInfo[]> {
    const command: GetUserCommand<UserInfo[]> = new GetUserCommand(
      this.apiService,
      this.getLinkedUserAdapter,
      this.tenantId,
      userId,
    );
    return command.execute();
  }

  exportAuditLogs(filterData, fileType: string) {
    const command: ExportAuditLogsCommand<string> = new ExportAuditLogsCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
      fileType,
    );
    filterData.timezone = true;
    var params: HttpParams;
    params = this.getQueryParamForAuditList(null, null, filterData);
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  setUserTenantId(data) {
    this.viewOperator.next(data);
  }

  setChangesFromLogs(data) {
    this.changesFromLogs.next(data);
  }

  setOperationTime(data) {
    this.operationTime.next(data);
  }
}
