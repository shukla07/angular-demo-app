import {Injectable} from '@angular/core';
import {ApiService} from '@vmsl/core/api/api.service';
import {GetUserListCommand} from '../../main/user/shared/commands/get-users.command';
import {Observable, BehaviorSubject} from 'rxjs';
import {UserListAdapter} from '../adapters/user-list-adapter.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {AddUserCommand} from '../../main/user/shared/commands/add-user.command';
import {AddUserAdapter} from '../adapters/user-adapter.service';
import {GetUserCommand} from '../../main/user/shared/commands/get-user.command';
import {EditUserCommand} from '../../main/user/shared/commands/edit-user.command';
import {HttpParams} from '@angular/common/http';
import {GetUserCountCommand} from '../../main/user/shared/commands/get-users-count.command';
import {AnyAdapter} from '@vmsl/core/api/adapters/any-adapter.service';
import {ExportUsersAsCSVCommand} from '../../main/user/shared/commands/export-users-csv.command';
import {ProfilePictureCommand} from '../../main/user/shared/commands/profile-picture.command';
import {UserInfo} from '@vmsl/core/auth/models/user.model';
import {userExportColumns} from '../../main/user/shared/user-export-columns';
import {DeleteUserCommand} from '../../main/user/shared/commands/delete-user.command';
import {UpdateBulkUsersStatus} from '../../main/user/shared/commands/update-users-status.command';
import {ResendRegisterEmailCommand} from '../../main/user/shared/commands/resend-register-email.command';
import {ImportUsersCommand} from '../../main/user/shared/commands/import-users.command';
import {GetContactList} from '../commands/get-contact-list.command';
import {ContactListAdapter} from '../adapters/contact-list-adapter.service';
import {UnlockUserCommand} from '../../main/user/shared/commands/unlock-user.command';
import {UserVisibility} from '@vmsl/core/enums/user-presence.enum';
import {Status} from '@vmsl/core/enums/status.enum';
import {MarkUserVisibilityCommand} from '../commands/mark-user-presence.command';
import {GetUserVisibility} from '../commands/get-user-presence.command';
import {GetUserFavourites} from '../commands/get-user-favourites.command';
import {UnMarkUserFavouriteCommand} from '../commands/unmark-user-fav.command';
import {MarkUserFavouriteCommand} from '../commands/mark-user-fav.command';
import {GetJobTitlesCommand} from '../commands/get-job-titles.command';
import {RoleType} from '@vmsl/core/enums';
import { JobTitle } from '../../main/job-titles-management/shared/models/job-titles-info.model';

@Injectable()
export class UserFacadeService {
  tenantId: string;
  private readonly userStatus = new BehaviorSubject<Object>(null);
  userStatusObv = this.userStatus.asObservable();

  private readonly userDelete = new BehaviorSubject<Object>(null);
  userDeleteObv = this.userDelete.asObservable();

  private readonly userUnlock = new BehaviorSubject<Object>(null);
  userUnlockObv = this.userUnlock.asObservable();

  private readonly webNotification = new BehaviorSubject<Object>(null);
  webNotificationObv = this.webNotification.asObservable();

  private readonly userSort = new BehaviorSubject<string>(null);
  userSortObv = this.userSort.asObservable();

  private readonly nameColumnSort = new BehaviorSubject<object>(null);
  nameColumnSortSortObv = this.nameColumnSort.asObservable();

  constructor(
    private readonly apiService: ApiService,
    private readonly userListAdapter: UserListAdapter,
    private readonly store: UserSessionStoreService,
    private readonly addUserAdapter: AddUserAdapter,
    private readonly anyAdapter: AnyAdapter,
    private readonly contactListAdapter: ContactListAdapter,
  ) {
    this.tenantId = this.store.getUser().tenantId;
  }

  getUserListFiltered(
    pageNo,
    itemsPerPage,
    filterData,
    sortOrder,
  ): Observable<UserInfo[]> {
    const command: GetUserListCommand<UserInfo> = new GetUserListCommand(
      this.apiService,
      this.userListAdapter,
      this.tenantId,
    );
    var params: HttpParams;
    params = this.getQueryParamForUserList(
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

  getUsersCount(filterData): Observable<number> {
    const command: GetUserCountCommand<number> = new GetUserCountCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    delete filterData.term;
    var params: HttpParams;
    params = this.getQueryParamForUserList(null, null, filterData);
    command.parameters = {
      observe: 'body',
      query: params,
    };
    return command.execute();
  }

  exportUserList(filterData, sortOrder, exportType) {
    const command: ExportUsersAsCSVCommand<string> = new ExportUsersAsCSVCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
      exportType,
    );
    var params: HttpParams;
    params = this.getQueryParamForUserList(
      null,
      null,
      filterData,
      exportType,
      sortOrder,
    );
    command.parameters = {
      observe: 'body',
      query: params,
    };
    return command.execute();
  }

  getQueryParamForUserList(
    pageNo,
    itemsPerPage,
    filterData,
    exportList?,
    sortOrder?,
  ) {
    const whereClause = {
      and: [],
    };

    //for filtering data
    const whereFilter = this.filterQueryParams(filterData, whereClause);

    //for pagination.
    const paginationFilter = this.paginationQueryParams(pageNo, itemsPerPage);

    // //for sorting
    var sortFilter;
    if (sortOrder && sortOrder.length > 0) {
      sortFilter = this.sortingQueryParams(sortOrder, paginationFilter);
    }

    // //for export
    var exportFilter;
    if (exportList) {
      if (sortOrder && sortOrder.length > 0) {
        exportFilter = this.exportQueryParams(sortFilter, whereFilter);
      } else {
        exportFilter = this.exportQueryParams(paginationFilter, whereFilter);
      }
    }

    //set query params
    let params = new HttpParams();
    if (Object.keys(paginationFilter).length > 0) {
      paginationFilter['where'] = whereFilter;
      params = params.set('filter', JSON.stringify(paginationFilter));
    } else if (exportFilter && Object.keys(exportFilter).length > 0) {
      exportFilter['where'] = whereFilter;
      params = params.set('filter', JSON.stringify(exportFilter));
    } else if (filterData.term) {
      const where = {where: whereFilter};
      params = params.set('filter', JSON.stringify(where));
    } else {
      params = params.set('where', JSON.stringify(whereFilter));
    }
    return params;
  }

  filterQueryParams(filterData, whereClause) {
    const userFilterId = [];

    if (filterData.userId && filterData.userId.length > 0) {
      if (filterData.userId.constructor === String) {
        userFilterId.push(filterData.userId);
      } else {
        filterData.userId.forEach(id => {
          userFilterId.push(id);
        });
      }
      whereClause.and.push({id: {inq: userFilterId}});
    }
    if (filterData.role) {
      whereClause.and.push({roleName: filterData.role});
    }
    if (filterData.status) {
      whereClause.and.push({status: filterData.status});
    }
    if (filterData.term) {
      whereClause.and.push({fullName: {ilike: `%${filterData.term}%`}});
    }
    whereClause.and.push({roleType: {nilike: RoleType.jrHcp.toString()}});

    return whereClause;
  }

  paginationQueryParams(pageNo, itemsPerPage) {
    const paginationFilter = {};
    if (pageNo && itemsPerPage) {
      const skipCount = (pageNo - 1) * itemsPerPage;
      paginationFilter['limit'] = itemsPerPage;
      paginationFilter['skip'] = skipCount;
      paginationFilter['order'] = ['createdOn DESC'];
    }
    return paginationFilter;
  }

  sortingQueryParams(sortOrder, filterObj) {
    filterObj['order'] = [];
    sortOrder.forEach(ele => {
      filterObj['order'].unshift(ele);
    });
    return filterObj;
  }

  exportQueryParams(exportList, whereFilter) {
    exportList['fields'] = userExportColumns;
    whereFilter.and.forEach(key => {
      if (key['status']) {
        switch (key['status']) {
          case '1':
            key['status'] = 'Active';
            break;
          case '2':
            key['status'] = 'Inactive';
            break;
          case '0':
            key['status'] = 'Registered';
            break;
        }
      }
    });
    if (!exportList['order']) {
      exportList['order'] = ['createdOn DESC'];
    }
    return exportList;
  }

  importUsers(csvFile): Observable<FormData> {
    const command: ImportUsersCommand<FormData> = new ImportUsersCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    command.parameters = {
      data: csvFile,
      observe: 'body',
    };
    return command.execute();
  }

  getUserList() {
    const command: GetUserListCommand<UserInfo> = new GetUserListCommand(
      this.apiService,
      this.userListAdapter,
      this.tenantId,
    );

    return command.execute();
  }

  addUser(user: UserInfo): Observable<UserInfo> {
    const command: AddUserCommand<UserInfo> = new AddUserCommand(
      this.apiService,
      this.addUserAdapter,
      this.tenantId,
    );
    command.parameters = {
      data: user,
    };
    return command.execute();
  }

  getUserById(userId: string): Observable<UserInfo> {
    const command: GetUserCommand<UserInfo> = new GetUserCommand(
      this.apiService,
      this.addUserAdapter,
      this.tenantId,
      userId,
    );
    return command.execute();
  }

  editUser(data: UserInfo, userId: string): Observable<UserInfo> {
    const command: EditUserCommand<UserInfo> = new EditUserCommand(
      this.apiService,
      this.addUserAdapter,
      this.tenantId,
      userId,
    );
    command.parameters = {
      data: data,
    };
    return command.execute();
  }

  resendRegisterationEmail(userId): Observable<Object> {
    const command: ResendRegisterEmailCommand<Object> = new ResendRegisterEmailCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
      userId,
    );
    command.parameters = {
      observe: 'body',
    };
    return command.execute();
  }

  deleteUser(userId): Observable<Object> {
    const command: DeleteUserCommand<Object> = new DeleteUserCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
      userId,
    );
    command.parameters = {
      observe: 'body',
    };
    return command.execute();
  }

  uploadProfile(profileData: FormData) {
    const command: ProfilePictureCommand<FormData> = new ProfilePictureCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    command.parameters = {
      data: profileData,
    };
    return command.execute();
  }

  updateBulkUsersStatus(userData: Object): Observable<Object> {
    const command: UpdateBulkUsersStatus<Object> = new UpdateBulkUsersStatus(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    command.parameters = {
      data: userData,
      observe: 'body',
    };
    return command.execute();
  }

  getMyContacts(): Observable<UserInfo[]> {
    const command: GetContactList<UserInfo> = new GetContactList(
      this.apiService,
      this.contactListAdapter,
      this.store.getUser().tenantId,
      this.store.getUser().id,
    );
    return command.execute();
  }

  unlockUser(userIds): Observable<string[]> {
    const command: UnlockUserCommand<string[]> = new UnlockUserCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    command.parameters = {
      data: userIds,
    };
    return command.execute();
  }

  markUserFavourite(favUser) {
    const command: MarkUserFavouriteCommand<object> = new MarkUserFavouriteCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    command.parameters = {
      data: {favUsers: favUser},
    };
    return command.execute();
  }

  markUserVisibility(userVisibility: UserVisibility) {
    const command: MarkUserVisibilityCommand<object> = new MarkUserVisibilityCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    command.parameters = {
      data: {userVisibility},
    };
    return command.execute();
  }

  unMarkUserFavourite(favUser) {
    const command: UnMarkUserFavouriteCommand<object> = new UnMarkUserFavouriteCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    command.parameters = {
      data: {favUsers: favUser},
    };
    return command.execute();
  }

  getUserFavourites() {
    const command: GetUserFavourites<{
      favUsers: string[];
      userInFav: string[];
    }> = new GetUserFavourites(this.apiService, this.anyAdapter, this.tenantId);
    return command.execute();
  }

  getUserVisibility() {
    const command: GetUserVisibility<{
      userVisibility: UserVisibility;
    }> = new GetUserVisibility(this.apiService, this.anyAdapter, this.tenantId);
    return command.execute();
  }

  getUsersBasedOnRole(roleName) {
    const command: GetUserListCommand<UserInfo> = new GetUserListCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    const query = {
      fields: {
        fullName: true,
        id: true,
        userTenantId: true,
      },
      where: {
        and: [{roleName: roleName}, {status: 1}],
      },
    };
    let params = new HttpParams();
    params = params.set('filter', JSON.stringify(query));
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getJobTitles(): Observable<JobTitle[]> {
    const command: GetJobTitlesCommand<JobTitle[]> = new GetJobTitlesCommand(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    let params = new HttpParams();
    const query = {
      where: {
        status: Status.active,
      },
      order: 'jobTitle ASC',
    };
    params = params.set('filter', JSON.stringify(query));
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  setUserStatus(data: object) {
    this.userStatus.next(data);
  }

  setUserToBeDeleted(data: Object) {
    this.userDelete.next(data);
  }

  setUserIdToUnlock(data: Object) {
    this.userUnlock.next(data);
  }

  setWebNotification(data: boolean) {
    this.webNotification.next(data);
  }

  setUserListSort(data: string) {
    this.userSort.next(data);
  }

  setNameColumnSort(data: Object) {
    this.nameColumnSort.next(data);
  }
}
