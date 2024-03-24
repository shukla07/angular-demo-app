import {HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AnyAdapter} from '@vmsl/core/api/adapters/any-adapter.service';
import {ApiService} from '@vmsl/core/api/api.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {ContentAdapter} from '../adapters/content-adapter.service';
import {AddContentCommand} from '../../main/content-management/shared/commands/add-content-command';
import {DeleteContentCommand} from '../../main/content-management/shared/commands/delete-content.command';
import {EditContentsCommand} from '../../main/content-management/shared/commands/edit-content.command';
import {ExportContentsCommand} from '../../main/content-management/shared/commands/export-contents.command';
import {GetContentCountCommand} from '../../main/content-management/shared/commands/get-contents-count.command';
import {GetContentsCommand} from '../../main/content-management/shared/commands/get-contents.command';
import {GetContentCommand} from '../../main/content-management/shared/commands/get-content.command';
import {ContentUploadCommand} from '../../main/content-management/shared/commands/content-upload.command';
import {UpdateContentStatusCommand} from '../../main/content-management/shared/commands/update-contents-status.command';
import {Content} from '../../main/content-management/shared/models/content-info.model';
import {ContentExportColumns} from '../../main/content-management/shared/contents-export-column';

@Injectable()
export class ContentManagementService {
  tenantId: string;
  private readonly contentStatus = new BehaviorSubject<Object>(null);
  contentStatusObv = this.contentStatus.asObservable();

  private readonly contentDelete = new BehaviorSubject<Object>(null);
  contentDeleteObv = this.contentDelete.asObservable();

  private readonly titleSort = new BehaviorSubject<Object>(null);
  titleSortObv = this.titleSort.asObservable();

  constructor(
    private readonly apiService: ApiService,
    private readonly store: UserSessionStoreService,
    private readonly anyAdapter: AnyAdapter,
    private readonly contentAdapter: ContentAdapter,
  ) {
    this.tenantId = this.store.getUser().tenantId;
  }

  getFilteredContentList(
    pageNo,
    itemsPerPage,
    filterData,
    sortOrder,
  ): Observable<Content[]> {
    const command: GetContentsCommand<Content> = new GetContentsCommand(
      this.apiService,
      this.contentAdapter,
      this.tenantId,
    );
    var params: HttpParams;
    params = this.getQuerryParamsForContentLists(
      pageNo,
      itemsPerPage,
      filterData,
      false,
      sortOrder,
    );
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getTitlesCount(filterData): Observable<number> {
    const command: GetContentCountCommand<number> = new GetContentCountCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    var params: HttpParams;
    params = this.getQuerryParamsForContentLists(null, null, filterData);
    command.parameters = {
      observe: 'body',
      query: params,
    };

    return command.execute();
  }

  getContentFiltersFiltered(): Observable<Content[]> {
    const command: GetContentsCommand<Content> = new GetContentsCommand(
      this.apiService,
      this.contentAdapter,
      this.tenantId,
    );
    const querryData = {
      fields: {
        title: true,
        id: true,
        status: true,
      },
    };
    var params = new HttpParams();
    params = params.set('filter', JSON.stringify(querryData));

    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  uploadContent(contentData: FormData) {
    const command: ContentUploadCommand<FormData> = new ContentUploadCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    command.parameters = {
      data: contentData,
    };
    return command.execute();
  }

  getQuerryParamsForContentLists(
    pageNo,
    itemsPerPage,
    filterData,
    csv = false,
    sortOrder?,
  ) {
    //for filtering data
    const titleFilterId = [];
    let whereClause = {
      and: [],
    };
    if (filterData.contentId && filterData.contentId.length > 0) {
      if (filterData.contentId.constructor === String) {
        titleFilterId.push(filterData.contentId);
      } else {
        filterData.contentId.forEach(id => {
          titleFilterId.push(id);
        });
      }
      whereClause.and.push({id: {inq: titleFilterId}});
    }

    whereClause = this.createWhereQuery(filterData, whereClause);

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
      queryData['fields'] = ContentExportColumns;
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

  createWhereQuery(filterData, whereClause) {
    if (filterData.status) {
      whereClause.and.push({
        status: filterData.status,
      });
    }
    if (filterData.fileType) {
      whereClause.and.push({
        fileType: filterData.fileType,
      });
    }
    if (filterData.term) {
      whereClause.and.push({title: {ilike: `%${filterData.term}%`}});
    }

    if (filterData.territories && filterData.territories.length) {
      const territoryOrClause = {or: []};
      filterData.territories.forEach(territory => {
        territoryOrClause.or.push({
          territorySearch: {
            ilike: `%${territory},%`,
          },
        });
      });
      whereClause.and.push(territoryOrClause);
    }
    if (filterData.therapeuticAreas && filterData.therapeuticAreas.length) {
      const therapeuticAreasOrClause = {or: []};
      filterData.therapeuticAreas.forEach(therapeuticareas => {
        therapeuticAreasOrClause.or.push({
          therapeuticSearch: {
            ilike: `%${therapeuticareas},%`,
          },
        });
      });
      whereClause.and.push(therapeuticAreasOrClause);
    }
    if (filterData.diseaseAreas && filterData.diseaseAreas.length) {
      const diseaseAreasOrClause = {or: []};
      filterData.diseaseAreas.forEach(diseaseareas => {
        diseaseAreasOrClause.or.push({
          diseaseSearch: {
            ilike: `%${diseaseareas},%`,
          },
        });
      });
      whereClause.and.push(diseaseAreasOrClause);
    }
    if (filterData.teamsNameList && filterData.teamsNameList.length) {
      const teamsNameListOrClause = {or: []};
      filterData.teamsNameList.forEach(teamsnamelist => {
        teamsNameListOrClause.or.push({
          teamSearch: {
            ilike: `%${teamsnamelist},%`,
          },
        });
      });
      whereClause.and.push(teamsNameListOrClause);
    }
    if (filterData.hcps && filterData.hcps.length) {
      const hcpsListOrClause = {or: []};
      filterData.hcps.forEach(hcp => {
        hcpsListOrClause.or.push({
          hcpSearch: {
            ilike: `%${hcp},%`,
          },
        });
      });
      whereClause.and.push(hcpsListOrClause);
    }
    return whereClause;
  }

  sortFilter(sortOrder) {
    if (sortOrder && sortOrder.length > 0) {
      return sortOrder;
    } else {
      return 'createdOn DESC';
    }
  }

  getContentById(contentId): Observable<Content> {
    const command: GetContentCommand<Content> = new GetContentCommand(
      this.apiService,
      this.contentAdapter,
      this.tenantId,
      contentId,
    );
    return command.execute();
  }

  addContent(title: Content): Observable<Content> {
    const command: AddContentCommand<Content> = new AddContentCommand(
      this.apiService,
      this.contentAdapter,
      this.tenantId,
    );
    command.parameters = {
      data: title,
    };
    return command.execute();
  }

  editContent(data: Content, contentId: string): Observable<Content> {
    const command: EditContentsCommand<Content> = new EditContentsCommand(
      this.apiService,
      this.contentAdapter,
      this.tenantId,
      contentId,
    );
    command.parameters = {
      data: data,
    };
    return command.execute();
  }

  updateBulkContentStatus(contentData: Object) {
    const command: UpdateContentStatusCommand<Object> = new UpdateContentStatusCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    command.parameters = {
      data: contentData,
    };
    return command.execute();
  }

  deleteContent(contentId): Observable<Object> {
    const command: DeleteContentCommand<Object> = new DeleteContentCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
      contentId,
    );
    command.parameters = {
      observe: 'body',
    };
    return command.execute();
  }

  exportContentList(filterData, exportType) {
    const command: ExportContentsCommand<string> = new ExportContentsCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
      exportType,
    );
    var params: HttpParams;
    params = this.getQuerryParamsForContentLists(null, null, filterData, true);
    command.parameters = {
      observe: 'body',
      query: params,
    };
    return command.execute();
  }

  setContentStatus(data: Object) {
    this.contentStatus.next(data);
  }

  setContentToBeDeleted(data: Object) {
    this.contentDelete.next(data);
  }

  setContentSort(data: Object) {
    this.titleSort.next(data);
  }
}
