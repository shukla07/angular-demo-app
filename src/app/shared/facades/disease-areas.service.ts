import {HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AnyAdapter} from '@vmsl/core/api/adapters/any-adapter.service';
import {ApiService} from '@vmsl/core/api/api.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {DiseaseAreasAdapter} from '../adapters/disease-areas-adapter.service';
import {AddDiseaseAreaCommand} from '../../main/disease-areas/shared/commands/add-disease-area-command';
import {DeleteDiseaseAreaCommand} from '../../main/disease-areas/shared/commands/delete-disease-area.command';
import {EditDiseaseAreaCommand} from '../../main/disease-areas/shared/commands/edit-disease-area.command';
import {ExportDiseaseAreasCommand} from '../../main/disease-areas/shared/commands/export-disease-areas.command';
import {GetDiseaseAreaCommand} from '../../main/disease-areas/shared/commands/get-disease-area.command';
import {GetDiseaseAreasCountCommand} from '../../main/disease-areas/shared/commands/get-disease-areas-count.command';
import {GetDiseaseAreasCommand} from '../../main/disease-areas/shared/commands/get-disease-areas.command';
import {UpdateDiseaseAreasStatusCommand} from '../../main/disease-areas/shared/commands/update-disease-areas-status.command';
import {diseaseAreasExportColumns} from '../../main/disease-areas/shared/disease-areas-export-column';
import {DiseaseArea} from '../../main/disease-areas/shared/models/disease-area-info.model';

@Injectable()
export class DiseaseAreasService {
  tenantId: string;
  private readonly diseaseAreaStatus = new BehaviorSubject<Object>(null);
  diseaseAreaStatusObv = this.diseaseAreaStatus.asObservable();

  private readonly diseaseAreaDelete = new BehaviorSubject<Object>(null);
  diseaseAreaDeleteObv = this.diseaseAreaDelete.asObservable();

  constructor(
    private readonly apiService: ApiService,
    private readonly store: UserSessionStoreService,
    private readonly anyAdapter: AnyAdapter,
    private readonly diseaseAreasAdapter: DiseaseAreasAdapter,
  ) {
    this.tenantId = this.store.getUser().tenantId;
  }

  getFilteredDiseaseAreasList(
    pageNo,
    itemsPerPage,
    filterData,
    sortOrder,
  ): Observable<DiseaseArea[]> {
    const command: GetDiseaseAreasCommand<DiseaseArea> = new GetDiseaseAreasCommand(
      this.apiService,
      this.diseaseAreasAdapter,
      this.tenantId,
    );
    var params: HttpParams;
    params = this.getQuerryParamsForDiseaseAreasLists(
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

  getDiseaseAreasCount(filterData): Observable<number> {
    const command: GetDiseaseAreasCountCommand<number> = new GetDiseaseAreasCountCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    var params: HttpParams;
    params = this.getQuerryParamsForDiseaseAreasLists(null, null, filterData);
    command.parameters = {
      observe: 'body',
      query: params,
    };

    return command.execute();
  }

  getDiseaseAreasFiltered(): Observable<DiseaseArea[]> {
    const command: GetDiseaseAreasCommand<DiseaseArea> = new GetDiseaseAreasCommand(
      this.apiService,
      this.diseaseAreasAdapter,
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

  getQuerryParamsForDiseaseAreasLists(
    pageNo,
    itemsPerPage,
    filterData,
    csv = false,
    sortOrder?,
  ) {
    //for filtering data
    const diseaseAreaFilterId = [];
    const whereClause = {
      and: [],
    };

    if (filterData.diseaseAreaId && filterData.diseaseAreaId.length > 0) {
      if (filterData.diseaseAreaId.constructor === String) {
        diseaseAreaFilterId.push(filterData.diseaseAreaId);
      } else {
        filterData.diseaseAreaId.forEach(id => {
          diseaseAreaFilterId.push(id);
        });
      }
      whereClause.and.push({id: {inq: diseaseAreaFilterId}});
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
      queryData['fields'] = diseaseAreasExportColumns;
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

  addDiseaseArea(diseaseArea: DiseaseArea): Observable<DiseaseArea> {
    const command: AddDiseaseAreaCommand<DiseaseArea> = new AddDiseaseAreaCommand(
      this.apiService,
      this.diseaseAreasAdapter,
      this.tenantId,
    );
    command.parameters = {
      data: diseaseArea,
    };
    return command.execute();
  }

  editDiseaseArea(
    data: DiseaseArea,
    diseaseAreaId: string,
  ): Observable<DiseaseArea> {
    const command: EditDiseaseAreaCommand<DiseaseArea> = new EditDiseaseAreaCommand(
      this.apiService,
      this.diseaseAreasAdapter,
      this.tenantId,
      diseaseAreaId,
    );
    command.parameters = {
      data: data,
    };
    return command.execute();
  }

  deleteDiseaseArea(diseaseAreaId): Observable<Object> {
    const command: DeleteDiseaseAreaCommand<Object> = new DeleteDiseaseAreaCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
      diseaseAreaId,
    );
    command.parameters = {
      observe: 'body',
    };
    return command.execute();
  }

  getDiseaseAreaById(diseaseAreaId): Observable<DiseaseArea> {
    const command: GetDiseaseAreaCommand<DiseaseArea> = new GetDiseaseAreaCommand(
      this.apiService,
      this.diseaseAreasAdapter,
      this.tenantId,
      diseaseAreaId,
    );
    return command.execute();
  }

  updateBulkDiseaseAreaStatus(diseaseAreaData: Object) {
    const command: UpdateDiseaseAreasStatusCommand<Object> = new UpdateDiseaseAreasStatusCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    command.parameters = {
      data: diseaseAreaData,
    };
    return command.execute();
  }

  exportdiseaseAreaList(filterData, exportType, orderFilter) {
    const command: ExportDiseaseAreasCommand<string> = new ExportDiseaseAreasCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
      exportType,
    );
    var params: HttpParams;
    params = this.getQuerryParamsForDiseaseAreasLists(
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

  setDiseaseAreaStatus(data: Object) {
    this.diseaseAreaStatus.next(data);
  }

  setDiseaseAreaToBeDeleted(data: Object) {
    this.diseaseAreaDelete.next(data);
  }
}
