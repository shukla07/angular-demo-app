import {HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AnyAdapter} from '@vmsl/core/api/adapters/any-adapter.service';
import {ApiService} from '@vmsl/core/api/api.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {JobTitlesAdapter} from '../adapters/job-titles-adapter.service';
import {AddJobTitlesCommand} from '../../main/job-titles-management/shared/commands/add-job-title-command';
import {DeleteJobTitlesCommand} from '../../main/job-titles-management/shared/commands/delete-job-title.command';
import {EditJobTitlesCommand} from '../../main/job-titles-management/shared/commands/edit-job-title.command';
import {ExportJobTitlesCommand} from '../../main/job-titles-management/shared/commands/export-job-titles.command';
import {GetJobTitlesCountCommand} from '../../main/job-titles-management/shared/commands/get-job-titles-count.command';
import {GetJobTitlesCommand} from '../../main/job-titles-management/shared/commands/get-job-titles.command';
import {GetJobTitleCommand} from '../../main/job-titles-management/shared/commands/get-job-title.command';
import {UpdateJobTitleStatusCommand} from '../../main/job-titles-management/shared/commands/update-job-titles-status.command';
import {JobTitle} from '../../main/job-titles-management/shared/models/job-titles-info.model';
import {jobTitleExportColumns} from '../../main/job-titles-management/shared/job-titles-export-column';

@Injectable()
export class JobTitlesManagementService {
  tenantId: string;
  private readonly jobTitleStatus = new BehaviorSubject<Object>(null);
  jobTitleStatusObv = this.jobTitleStatus.asObservable();

  private readonly jobTitleDelete = new BehaviorSubject<Object>(null);
  jobTitleDeleteObv = this.jobTitleDelete.asObservable();

  private readonly titleSort = new BehaviorSubject<Object>(null);
  titleSortObv = this.titleSort.asObservable();

  constructor(
    private readonly apiService: ApiService,
    private readonly store: UserSessionStoreService,
    private readonly anyAdapter: AnyAdapter,
    private readonly jobTitlesAdapter: JobTitlesAdapter,
  ) {
    this.tenantId = this.store.getUser().tenantId;
  }

  getFilteredJobTitlesList(
    pageNo,
    itemsPerPage,
    filterData,
    sortOrder,
  ): Observable<JobTitle[]> {
    const command: GetJobTitlesCommand<JobTitle> = new GetJobTitlesCommand(
      this.apiService,
      this.jobTitlesAdapter,
      this.tenantId,
    );
    var params: HttpParams;
    params = this.getQuerryParamsForJobTitlesLists(
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

  getTitlesCount(filterData): Observable<number> {
    const command: GetJobTitlesCountCommand<number> = new GetJobTitlesCountCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    var params: HttpParams;
    params = this.getQuerryParamsForJobTitlesLists(null, null, filterData);
    command.parameters = {
      observe: 'body',
      query: params,
    };

    return command.execute();
  }

  getJobFiltersFiltered(): Observable<JobTitle[]> {
    const command: GetJobTitlesCommand<JobTitle> = new GetJobTitlesCommand(
      this.apiService,
      this.jobTitlesAdapter,
      this.tenantId,
    );
    const querryData = {
      fields: {
        jobTitle: true,
        id: true,
        status: true,
      },
      order: 'jobTitle ASC',
    };
    var params = new HttpParams();
    params = params.set('filter', JSON.stringify(querryData));

    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getQuerryParamsForJobTitlesLists(
    pageNo,
    itemsPerPage,
    filterData,
    csv = false,
    sortOrder?,
  ) {
    //for filtering data
    const titleFilterId = [];
    const whereClause = {
      and: [],
    };

    if (filterData.jobTitleId && filterData.jobTitleId.length > 0) {
      if (filterData.jobTitleId.constructor === String) {
        titleFilterId.push(filterData.jobTitleId);
      } else {
        filterData.jobTitleId.forEach(id => {
          titleFilterId.push(id);
        });
      }
      whereClause.and.push({id: {inq: titleFilterId}});
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
      queryData['fields'] = jobTitleExportColumns;
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

  getJobTitleById(jobTitleId): Observable<JobTitle> {
    const command: GetJobTitleCommand<JobTitle> = new GetJobTitleCommand(
      this.apiService,
      this.jobTitlesAdapter,
      this.tenantId,
      jobTitleId,
    );
    return command.execute();
  }

  addJobTitle(jobTitle: JobTitle): Observable<JobTitle> {
    const command: AddJobTitlesCommand<JobTitle> = new AddJobTitlesCommand(
      this.apiService,
      this.jobTitlesAdapter,
      this.tenantId,
    );
    command.parameters = {
      data: jobTitle,
    };
    return command.execute();
  }

  editJobTitle(data: JobTitle, jobTitleId: string): Observable<JobTitle> {
    const command: EditJobTitlesCommand<JobTitle> = new EditJobTitlesCommand(
      this.apiService,
      this.jobTitlesAdapter,
      this.tenantId,
      jobTitleId,
    );
    command.parameters = {
      data: data,
    };
    return command.execute();
  }

  updateBulkJobTitleStatus(jobTitleData: Object) {
    const command: UpdateJobTitleStatusCommand<Object> = new UpdateJobTitleStatusCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    command.parameters = {
      data: jobTitleData,
    };
    return command.execute();
  }

  deleteJobTitle(jobTitleId): Observable<Object> {
    const command: DeleteJobTitlesCommand<Object> = new DeleteJobTitlesCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
      jobTitleId,
    );
    command.parameters = {
      observe: 'body',
    };
    return command.execute();
  }

  exportJobTitleList(filterData, exportType, orderFilter) {
    const command: ExportJobTitlesCommand<string> = new ExportJobTitlesCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
      exportType,
    );
    var params: HttpParams;
    params = this.getQuerryParamsForJobTitlesLists(
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

  setJobTitleStatus(data: Object) {
    this.jobTitleStatus.next(data);
  }

  setJobTitleToBeDeleted(data: Object) {
    this.jobTitleDelete.next(data);
  }

  setJobTitleSort(data: Object) {
    this.titleSort.next(data);
  }
}
