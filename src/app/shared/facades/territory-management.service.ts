import {HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AnyAdapter} from '@vmsl/core/api/adapters/any-adapter.service';
import {ApiService} from '@vmsl/core/api/api.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {TerritoriesAdapter} from '../adapters/territories-adapter.service';
import {AddTerritoryCommand} from '../../main/territories-management/shared/commands/add-territory-command';
import {DeleteTerritoryCommand} from '../../main/territories-management/shared/commands/delete-territory.command';
import {EditTerritoryCommand} from '../../main/territories-management/shared/commands/edit-territory.command';
import {ExportTerritoriesCommand} from '../../main/territories-management/shared/commands/export-territories.command';
import {GetTerritoriesCountCommand} from '../../main/territories-management/shared/commands/get-territories-count.command';
import {GetTerritoriesCommand} from '../../main/territories-management/shared/commands/get-territories.command';
import {GetTerritoryCommand} from '../../main/territories-management/shared/commands/get-territory.command';
import {UpdateTerrotoriesStatusCommand} from '../../main/territories-management/shared/commands/update-territories-status.command';
import {Territory} from '../../main/territories-management/shared/models/territory-info.model';
import {territoryExportColumns} from '../../main/territories-management/shared/territories-export-column';

@Injectable()
export class TerritoryManagementService {
  tenantId: string;
  private readonly territoryStatus = new BehaviorSubject<Object>(null);
  territoryStatusObv = this.territoryStatus.asObservable();

  private readonly territoryDelete = new BehaviorSubject<Object>(null);
  territoryDeleteObv = this.territoryDelete.asObservable();

  constructor(
    private readonly apiService: ApiService,
    private readonly store: UserSessionStoreService,
    private readonly anyAdapter: AnyAdapter,
    private readonly territoriesAdapter: TerritoriesAdapter,
  ) {
    this.tenantId = this.store.getUser().tenantId;
  }

  getFilteredTerritoriesList(
    pageNo,
    itemsPerPage,
    filterData,
    sortOrder,
  ): Observable<Territory[]> {
    const command: GetTerritoriesCommand<Territory> = new GetTerritoriesCommand(
      this.apiService,
      this.territoriesAdapter,
      this.tenantId,
    );
    var params: HttpParams;
    params = this.getQuerryParamsForTerritoriesLists(
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

  getTerritoriesCount(filterData): Observable<number> {
    const command: GetTerritoriesCountCommand<number> = new GetTerritoriesCountCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    var params: HttpParams;
    params = this.getQuerryParamsForTerritoriesLists(null, null, filterData);
    command.parameters = {
      observe: 'body',
      query: params,
    };

    return command.execute();
  }

  getTerritoriesFiltered(): Observable<Territory[]> {
    const command: GetTerritoriesCommand<Territory> = new GetTerritoriesCommand(
      this.apiService,
      this.territoriesAdapter,
      this.tenantId,
    );
    const querryData = {
      fields: {
        name: true,
        id: true,
        status: true,
      },
      order: 'name ASC',
    };
    var params = new HttpParams();
    params = params.set('filter', JSON.stringify(querryData));

    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getQuerryParamsForTerritoriesLists(
    pageNo,
    itemsPerPage,
    filterData,
    csv = false,
    sortOrder?,
  ) {
    //for filtering data
    const territoryFilterId = [];
    const whereClause = {
      and: [],
    };

    if (filterData.territoryId && filterData.territoryId.length > 0) {
      if (filterData.territoryId.constructor === String) {
        territoryFilterId.push(filterData.territoryId);
      } else {
        filterData.territoryId.forEach(id => {
          territoryFilterId.push(id);
        });
      }
      whereClause.and.push({id: {inq: territoryFilterId}});
    }

    if (filterData.status) {
      whereClause.and.push({
        status: filterData.status,
      });
    }

    //for pagination.
    const queryData = {};
    if (pageNo && itemsPerPage) {
      const skipCount = (pageNo - 1) * itemsPerPage;
      queryData['limit'] = itemsPerPage;
      queryData['skip'] = skipCount;
      queryData['order'] = 'createdOn DESC';
    }

    //for sorting
    queryData['order'] = this.sortFilter(sortOrder);

    //for CSV
    if (csv) {
      queryData['fields'] = territoryExportColumns;
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

  sortFilter(sortOrder) {
    if (sortOrder && sortOrder.length > 0) {
      return sortOrder;
    } else {
      return 'createdOn DESC';
    }
  }

  getTerritoryById(territoryId): Observable<Territory> {
    const command: GetTerritoryCommand<Territory> = new GetTerritoryCommand(
      this.apiService,
      this.territoriesAdapter,
      this.tenantId,
      territoryId,
    );
    return command.execute();
  }

  addTerritory(territory: Territory): Observable<Territory> {
    const command: AddTerritoryCommand<Territory> = new AddTerritoryCommand(
      this.apiService,
      this.territoriesAdapter,
      this.tenantId,
    );
    command.parameters = {
      data: territory,
    };
    return command.execute();
  }

  editTerritory(data: Territory, territoryId: string): Observable<Territory> {
    const command: EditTerritoryCommand<Territory> = new EditTerritoryCommand(
      this.apiService,
      this.territoriesAdapter,
      this.tenantId,
      territoryId,
    );
    command.parameters = {
      data: data,
    };
    return command.execute();
  }

  updateBulkTerritoryStatus(territoryData: Object) {
    const command: UpdateTerrotoriesStatusCommand<Object> = new UpdateTerrotoriesStatusCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    command.parameters = {
      data: territoryData,
    };
    return command.execute();
  }

  deleteTerritory(territoryId): Observable<Object> {
    const command: DeleteTerritoryCommand<Object> = new DeleteTerritoryCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
      territoryId,
    );
    command.parameters = {
      observe: 'body',
    };
    return command.execute();
  }

  exportTerritoryList(filterData, exportType, orderFilter) {
    const command: ExportTerritoriesCommand<string> = new ExportTerritoriesCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
      exportType,
    );
    var params: HttpParams;
    params = this.getQuerryParamsForTerritoriesLists(
      null,
      null,
      filterData,
      true,
      orderFilter,
    );
    command.parameters = {
      observe: 'body',
      query: params,
    };
    return command.execute();
  }

  setTerritoryStatus(data: Object) {
    this.territoryStatus.next(data);
  }

  setTerritoryToBeDeleted(data: Object) {
    this.territoryDelete.next(data);
  }
}
