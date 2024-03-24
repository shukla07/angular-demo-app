import {HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AnyAdapter} from '@vmsl/core/api/adapters/any-adapter.service';
import {ApiService} from '@vmsl/core/api/api.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {TherapeuticAreasAdapter} from '../adapters/therapeutic-areas-adapter.service';
import {AddTherapeuticAreaCommand} from '../../main/therapeutic-areas-management/shared/commands/add-therapeutic-area-command';
import {DeleteTherapeuticAreaCommand} from '../../main/therapeutic-areas-management/shared/commands/delete-therapeutic-area.command';
import {EditTherapeuticAreaCommand} from '../../main/therapeutic-areas-management/shared/commands/edit-therapeutic-area.command';
import {ExportTherapeuticAreasCommand} from '../../main/therapeutic-areas-management/shared/commands/export-therapeutic-areas.command';
import {GetTherapeuticAreaCommand} from '../../main/therapeutic-areas-management/shared/commands/get-therapeutic-area.command';
import {GetTherapeuticAreasCountCommand} from '../../main/therapeutic-areas-management/shared/commands/get-therapeutic-areas-count.command';
import {GetTherapeuticAreasCommand} from '../../main/therapeutic-areas-management/shared/commands/get-therapeutic-areas.command';
import {UpdateTherapeuticAreasStatusCommand} from '../../main/therapeutic-areas-management/shared/commands/update-therapeutic-areas-status.command';
import {TherapeuticArea} from '../../main/therapeutic-areas-management/shared/models/therapeutic-area-info.model.ts';
import {therapeuticAreasExportColumns} from '../../main/therapeutic-areas-management/shared/therapeutic-areas-export-column';

@Injectable()
export class TherapeuticAreasService {
  tenantId: string;
  private readonly therapeuticAreaStatus = new BehaviorSubject<Object>(null);
  therapeuticAreaStatusObv = this.therapeuticAreaStatus.asObservable();

  private readonly therapeuticAreaDelete = new BehaviorSubject<Object>(null);
  therapeuticAreaDeleteObv = this.therapeuticAreaDelete.asObservable();

  constructor(
    private readonly apiService: ApiService,
    private readonly store: UserSessionStoreService,
    private readonly anyAdapter: AnyAdapter,
    private readonly therapeuticAreasAdapter: TherapeuticAreasAdapter,
  ) {
    this.tenantId = this.store.getUser().tenantId;
  }

  getFilteredTherapeuticAreasList(
    pageNo,
    itemsPerPage,
    filterData,
    sortOrder,
  ): Observable<TherapeuticArea[]> {
    const command: GetTherapeuticAreasCommand<TherapeuticArea> = new GetTherapeuticAreasCommand(
      this.apiService,
      this.therapeuticAreasAdapter,
      this.tenantId,
    );
    var params: HttpParams;
    params = this.getQuerryParamsForTherapeuticAreasLists(
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

  getTherapeuticAreasCount(filterData): Observable<number> {
    const command: GetTherapeuticAreasCountCommand<number> = new GetTherapeuticAreasCountCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    var params: HttpParams;
    params = this.getQuerryParamsForTherapeuticAreasLists(
      null,
      null,
      filterData,
    );
    command.parameters = {
      observe: 'body',
      query: params,
    };

    return command.execute();
  }

  getTherapeuticAreasFiltered(): Observable<TherapeuticArea[]> {
    const command: GetTherapeuticAreasCommand<TherapeuticArea> = new GetTherapeuticAreasCommand(
      this.apiService,
      this.therapeuticAreasAdapter,
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

  getQuerryParamsForTherapeuticAreasLists(
    pageNo,
    itemsPerPage,
    filterData,
    csv = false,
    sortOrder?,
  ) {
    //for filtering data
    const therapeuticAreaFilterId = [];
    const whereClause = {
      and: [],
    };

    if (
      filterData.therapeuticAreaId &&
      filterData.therapeuticAreaId.length > 0
    ) {
      if (filterData.therapeuticAreaId.constructor === String) {
        therapeuticAreaFilterId.push(filterData.therapeuticAreaId);
      } else {
        filterData.therapeuticAreaId.forEach(id => {
          therapeuticAreaFilterId.push(id);
        });
      }
      whereClause.and.push({id: {inq: therapeuticAreaFilterId}});
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
      queryData['fields'] = therapeuticAreasExportColumns;
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

  getTherapeuticAreaById(therapeuticAreaId): Observable<TherapeuticArea> {
    const command: GetTherapeuticAreaCommand<TherapeuticArea> = new GetTherapeuticAreaCommand(
      this.apiService,
      this.therapeuticAreasAdapter,
      this.tenantId,
      therapeuticAreaId,
    );
    return command.execute();
  }

  addTherapeuticArea(
    therapeuticArea: TherapeuticArea,
  ): Observable<TherapeuticArea> {
    const command: AddTherapeuticAreaCommand<TherapeuticArea> = new AddTherapeuticAreaCommand(
      this.apiService,
      this.therapeuticAreasAdapter,
      this.tenantId,
    );
    command.parameters = {
      data: therapeuticArea,
    };
    return command.execute();
  }

  editTherapeuticArea(
    data: TherapeuticArea,
    therapeuticAreaId: string,
  ): Observable<TherapeuticArea> {
    const command: EditTherapeuticAreaCommand<TherapeuticArea> = new EditTherapeuticAreaCommand(
      this.apiService,
      this.therapeuticAreasAdapter,
      this.tenantId,
      therapeuticAreaId,
    );
    command.parameters = {
      data: data,
    };
    return command.execute();
  }

  updateBulkTherapeuticAreaStatus(therapeuticAreaData: Object) {
    const command: UpdateTherapeuticAreasStatusCommand<Object> = new UpdateTherapeuticAreasStatusCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    command.parameters = {
      data: therapeuticAreaData,
    };
    return command.execute();
  }

  deleteTherapeuticArea(therapeuticAreaId): Observable<Object> {
    const command: DeleteTherapeuticAreaCommand<Object> = new DeleteTherapeuticAreaCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
      therapeuticAreaId,
    );
    command.parameters = {
      observe: 'body',
    };
    return command.execute();
  }

  exportTherapeuticAreaList(filterData, exportType, orderFilter) {
    const command: ExportTherapeuticAreasCommand<string> = new ExportTherapeuticAreasCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
      exportType,
    );
    var params: HttpParams;
    params = this.getQuerryParamsForTherapeuticAreasLists(
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

  setTherapeuticAreaStatus(data: Object) {
    this.therapeuticAreaStatus.next(data);
  }

  setTherapeuticAreaToBeDeleted(data: Object) {
    this.therapeuticAreaDelete.next(data);
  }
}
