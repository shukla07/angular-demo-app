import {Injectable} from '@angular/core';
import {ApiService} from '@vmsl/core/api/api.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {GetHcpRequestCommand} from '../commands/get-hcp-requests.command';
import {Observable, BehaviorSubject} from 'rxjs';
import {UserInfo} from '@vmsl/core/auth/models/user.model';
import {HcpRequestListAdapter} from '../adapters/hcprequest-list-adapter.service';
import {RespondToHCPRequestCommand} from '../commands/respond-hcp-request.command';
import {AnyAdapter} from '@vmsl/core/api/adapters/any-adapter.service';
import {HttpParams} from '@angular/common/http';
import {GetHcpRequestCountCommand} from '../commands/get-hcp-requests-count-command';

@Injectable()
export class HcpManagementService {
  tenantId: string;
  private readonly responseToHcpRequest = new BehaviorSubject<Object>(null);
  responseAsObv = this.responseToHcpRequest.asObservable();
  private readonly hcpToBeViewed = new BehaviorSubject<Object>(null);
  hcpInfoAsObv = this.hcpToBeViewed.asObservable();

  constructor(
    private readonly apiService: ApiService,
    private readonly store: UserSessionStoreService,
    private readonly hcpRequestListAdapter: HcpRequestListAdapter,
    private readonly anyAdapter: AnyAdapter,
  ) {
    this.tenantId = this.store.getUser().tenantId;
  }

  getHcpRequests(pageNo, itemsPerPage, filterData): Observable<UserInfo[]> {
    const command: GetHcpRequestCommand<UserInfo> = new GetHcpRequestCommand(
      this.apiService,
      this.hcpRequestListAdapter,
      this.tenantId,
    );
    var params: HttpParams;
    params = this.getQueryParamForHcpList(pageNo, itemsPerPage, filterData);
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getHcpRequestsCount(filterData): Observable<number> {
    const command: GetHcpRequestCountCommand<number> = new GetHcpRequestCountCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    var params: HttpParams;
    params = this.getQueryParamForHcpList(null, null, filterData);
    command.parameters = {
      observe: 'body',
      query: params,
    };
    return command.execute();
  }

  getHcpListFiltered() {
    const command: GetHcpRequestCommand<UserInfo> = new GetHcpRequestCommand(
      this.apiService,
      this.hcpRequestListAdapter,
      this.tenantId,
    );
    const queryData = {};
    queryData['fields'] = {firstName: true, lastName: true, id: true};
    let params = new HttpParams();
    params = params.set('filter', JSON.stringify(queryData));
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  respondToHcpRequest(
    hcpIds: string[],
    referralStatus: string,
  ): Observable<Object> {
    const command: RespondToHCPRequestCommand<Object> = new RespondToHCPRequestCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    command.parameters = {
      data: {
        referralStatus: referralStatus,
        userIds: hcpIds,
      },
    };
    return command.execute();
  }

  getQueryParamForHcpList(pageNo, itemsPerPage, filterData) {
    //for filtering data
    const userFilterId = [];
    const whereClause = {
      and: [],
    };

    if (filterData.hcpId && filterData.hcpId.length > 0) {
      if (filterData.hcpId.constructor === String) {
        userFilterId.push(filterData.hcpId);
      } else {
        filterData.hcpId.forEach(id => {
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
      queryData['order'] = 'referralStatus, createdOn DESC';
    }

    //set query params
    let params = new HttpParams();
    if (Object.keys(queryData).length > 0) {
      if (whereClause.and.length > 0) {
        queryData['where'] = whereClause;
      }
      params = params.set('filter', JSON.stringify(queryData));
    } else {
        params = params.set('filter', JSON.stringify(whereClause));
    }
    return params;
  }

  setHcpInfo(data: UserInfo) {
    this.hcpToBeViewed.next(data);
  }

  setResponseToRequest(data: Object) {
    this.responseToHcpRequest.next(data);
  }
}
