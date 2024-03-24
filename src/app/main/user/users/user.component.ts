import {
  Component,
  ViewEncapsulation,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { RouteComponentBase } from '@vmsl/core/route-component-base';
import { UserFacadeService } from '../../../shared/facades/user-facade.service';
import { IVmslGridColumn } from '@vmsl/shared/vmsl-grid/wrapper-interfaces';
import { NbDialogService, NbDialogModule, NbDialogRef } from '@nebular/theme';
import { columnDefinitions } from '../shared/models/user-grid-header';
import { Permission } from '@vmsl/core/auth/permission-key.enum';
import { NgForm } from '@angular/forms';
import { SystemStoreFacadeService } from '@vmsl/core/store/system-store-facade.service';
import { Role } from '@vmsl/core/store/models';
import { UserInfo } from '@vmsl/core/auth/models/user.model';
import { Subject } from 'rxjs';
import { environment } from '@vmsl/env/environment';
import { ToastrService } from 'ngx-toastr';
import { pageLimitMaxThousand } from '@vmsl/shared/model/items-per-page-list';
import { Observable } from 'rxjs/internal/Observable';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { RoleType } from '@vmsl/core/enums/roles.enum';

@Component({
  selector: 'vmsl-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UserComponent extends RouteComponentBase {
  isUnverifiedSelected: number[] = [];
  userList: UserInfo[];
  title = "User's List";
  columnDefinition: IVmslGridColumn[];
  rowChecked = false;
  statusTemplateSwitch = false;
  deleteTemplateSwitch = false;
  unlockTemplateSwitch = false;
  userId: string;
  private gridApi;
  private gridColumnApi;
  itemsPerPage: number;
  permissionKey = Permission;
  currentPage = 1;
  totalUsersCount: number;
  userNameList: Observable<UserInfo[]>;
  loading = false;
  sendEmailLoading = false;
  importLoading = false;
  unlockLoading = false;
  roles: Role[];
  selectedRows: UserInfo[];
  csvFile: File;
  filter = {
    role: null,
    userId: [],
    status: '',
    term: '',
  };
  orderFilter = [];
  itemsPerPageList = pageLimitMaxThousand;
  isSearched = false;
  noRowsTemplate = '<span>No users found.</span>';
  dropdownCount: Subject<number> = new Subject<number>();
  csvDialogRef: NbDialogRef<NbDialogModule>;
  statusDialogRef: NbDialogRef<NbDialogModule>;
  deleteDialogRef: NbDialogRef<NbDialogModule>;
  unlockDialogRef: NbDialogRef<NbDialogModule>;
  userSearchStr = new Subject<string | null>();

  @ViewChild('userStatusDialog', { read: TemplateRef })
  userStatusDialog: TemplateRef<NbDialogModule>;
  @ViewChild('form') form: NgForm;
  @ViewChild('deleteUserDialog', { read: TemplateRef })
  deleteUserDialog: TemplateRef<NbDialogModule>;
  @ViewChild('csvDropZone', { read: TemplateRef })
  csvDropZone: TemplateRef<NbDialogModule>;
  @ViewChild('unlockUserDialog', { read: TemplateRef })
  unlockUserDialog: TemplateRef<NbDialogModule>;

  constructor(
    private readonly router: Router,
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly userService: UserFacadeService,
    private readonly dialogService: NbDialogService,
    private readonly systemStore: SystemStoreFacadeService,
    private readonly tostr: ToastrService,
    private readonly loaderService: NgxUiLoaderService,
  ) {
    super(route, location);
    this._subscriptions.push(
      this.userService.userStatusObv.subscribe(resp => {
        if (resp) {
          this.open(this.userStatusDialog, resp, 'single');
          this.userService.setUserStatus(null);
        }
      }),
    );

    this._subscriptions.push(
      this.userService.userDeleteObv.subscribe(resp => {
        if (resp) {
          this.open(this.deleteUserDialog, resp, 'single');
          this.userService.setUserToBeDeleted(null);
        }
      }),
    );

    this._subscriptions.push(
      this.userService.userUnlockObv.subscribe(resp => {
        if (resp) {
          this.openUserUnlockDialog(this.unlockUserDialog, resp);
          this.userService.setUserIdToUnlock(null);
        }
      }),
    );

    this._subscriptions.push(
      this.userService.userSortObv.subscribe(resp => {
        if (resp) {
          this.sortUserList(resp);
          this.userService.setUserListSort(null);
        }
      }),
    );

    this.userSearchStr.subscribe(res => {
      if (res) {
        this.filter.term = res;
        this.getUserNamesForFilter();
      }
    });
  }

  ngOnInit() {
    super.ngOnInit();
    this.systemStore.getRoles().subscribe(resp => {
      this.roles = resp;
    });
    this.itemsPerPage = 10;
    this.columnDefinition = columnDefinitions();
    this.getUserList(this.currentPage, this.itemsPerPage);
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.setDomLayout('autoHeight');
    this.autoSizeColumn();
  }

  getUserNamesForFilter() {
    this.userNameList = this.userService.getUserListFiltered(
      null,
      null,
      this.filter,
      ['fullName ASC'],
    );
  }

  getPaginationValue(data) {
    this.itemsPerPage = data;
    this.getUserList(this.currentPage, data);
  }

  onRowChecked(param) {
    if (param.api.getSelectedRows().length > 0) {
      if (
        param.data.status === 0 &&
        this.isUnverifiedSelected.includes(param.rowIndex)
      ) {
        const temp = this.isUnverifiedSelected.indexOf(param.rowIndex);
        if (temp > -1) {
          this.isUnverifiedSelected.splice(temp, 1);
        }
      } else if (param.data.status === 0) {
        this.rowChecked = true;
        this.isUnverifiedSelected.push(param.rowIndex);
      } else {
        this.rowChecked = true;
      }
    } else if (param.data.status === 0) {
      this.isUnverifiedSelected.pop();
      this.rowChecked = false;
    } else {
      this.rowChecked = false;
    }
  }

  onClickAddUser() {
    this.router.navigate(['/main/user/add']);
  }

  onClearFilter(form) {
    this.isSearched = false;
    form.resetForm();
    this.filter.term = '';
    this.itemsPerPage = 10;
    this.currentPage = 1;
    this.gridApi.deselectAll();
    this.emitCountToChild();
  }

  emitCountToChild() {
    this.dropdownCount.next(this.itemsPerPage);
  }

  checkColumnSelection(type: string) {
    this.selectedRows = this.gridApi.getSelectedRows();
    const maxExportRowsLimit = 5;
    if (this.selectedRows.length) {
      if (this.selectedRows.length <= maxExportRowsLimit) {
        this.filter.userId = [];
        this.selectedRows.forEach(territory => {
          this.filter.userId.push(territory.id);
        });
        this.exportUserList(type);
      } else {
        this.tostr.warning('Please select 5 users or less.', 'Attention', {
          timeOut: environment.messageTimeout,
        });
      }
    } else {
      this.exportUserList(type);
    }
  }

  exportUserList(type) {
    this._subscriptions.push(
      this.userService
        .exportUserList(this.filter, this.orderFilter, type)
        .subscribe(resp => {
          const downloadLink = document.createElement('a');
          downloadLink.href = resp['fileUrl'];
          downloadLink.download = 'download';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          this.gridApi.deselectAll();
        }),
    );
  }

  open(dialog: TemplateRef<NbDialogModule>, data: Object, type: string) {
    this.userId = data['id'];
    if (data['userName']) {
      this.deleteDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: {
          message: `Do you really want to delete ${data['userName']}?`,
          isTeamMember: data['teamNames'] ? true : false,
          teamMessage: `This user belongs to following team(s) - ${data['teamNames']}`,
          status: 'delete',
          verified: true,
          confirmMessage: `${data['userName']} has been deleted`,
        },
      });
    } else if (data['status'] === 'inactive' || data === 'success') {
      this.statusDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: {
          message: 'Do you really want to activate selected user/users?',
          status: 'activate',
          verified: true,
          confirmMessage: 'User has been activated',
          type: type,
        },
      });
    } else if (data['status'] === 'active' || data === 'danger') {
      this.statusDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: {
          message: 'Do you really want to deactivate selected user/users?',
          status: 'deactivate',
          verified: true,
          confirmMessage: 'User has been deactivated',
          type: type,
        },
      });
    } else {
      this.statusDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: {
          message:
            'Do you want to resend registration email to the user/users?',
          verified: false,
          confirmMessage: 'Registration email has been sent successfully',
        },
      });
    }
  }

  openUserUnlockDialog(dialog: TemplateRef<NbDialogModule>, data: Object) {
    this.userId = data['id'];
    this.unlockDialogRef = this.dialogService.open(dialog, {
      closeOnBackdropClick: false,
      context: {
        message: `Do you really want to unlock ${data['userName']}?`,
        status: 'unlock',
        verified: true,
        confirmMessage: `${data['userName']} has been unlocked`,
      },
    });
  }

  activOrDeactivUser() {
    let user = new UserInfo();
    this._subscriptions.push(
      this.userService.getUserById(this.userId).subscribe(res => {
        user = res;
        const inactiveStatus = 2;
        if (user.status === inactiveStatus) {
          user.status = 1;
        } else {
          user.status = inactiveStatus;
        }
        this.userService.editUser(user, this.userId).subscribe(() => {
          this.getUserList(this.currentPage, this.itemsPerPage);
          this.statusTemplateSwitch = true;
        });
      }),
    );
  }

  bulkUserStatusChange(status) {
    this.selectedRows = this.gridApi.getSelectedRows();
    if (this.selectedRows.length > 0) {
      const selectedUserId = [];
      this.selectedRows.forEach(user => {
        selectedUserId.push(user.userTenantId);
      });
      const inactiveStatus = 2;
      const updatedStatus = status === 'deactivate' ? inactiveStatus : 1;
      const userData = { userTenantId: selectedUserId, status: updatedStatus };
      this.userService.updateBulkUsersStatus(userData).subscribe(resp => {
        if (resp['success']) {
          this.getUserList(this.currentPage, this.itemsPerPage);
          this.statusTemplateSwitch = true;
        }
      });
    }
  }

  resendRegistrationEmail() {
    this.sendEmailLoading = true;
    this._subscriptions.push(
      this.userService.resendRegisterationEmail(this.userId).subscribe(resp => {
        if (resp['success']) {
          this.statusTemplateSwitch = true;
          this.sendEmailLoading = false;
        }
      }),
    );
  }

  deleteUser() {
    this._subscriptions.push(
      this.userService.deleteUser(this.userId).subscribe(resp => {
        if (!resp) {
          this.getUserList(this.currentPage, this.itemsPerPage);
          this.deleteTemplateSwitch = true;
          this.rowChecked = false;
          this.getUserNamesForFilter();
        }
      }),
    );
  }

  getUserList(pageNo, itemsPerPage, form?) {
    if (form) {
      this.loading = true;
    }
    this._subscriptions.push(
      this.userService
        .getUserListFiltered(
          pageNo,
          itemsPerPage,
          this.filter,
          this.orderFilter,
        )
        .subscribe(resp => {
          if (resp.length > 0) {
            this.getUserListCount();
            this.userList = resp;

            this.loading = false;
          } else {
            this.userService
              .getUserListFiltered(
                1,
                this.itemsPerPage,
                this.filter,
                this.orderFilter,
              )
              .subscribe(
                res => {
                  this.getUserListCount();
                  this.userList = res;
                  this.loading = false;
                },
                error => {
                  this.loading = false;
                  form.reset();
                },
              );
            this.currentPage = 1;
          }
        }),
    );
  }

  autoSizeColumn() {
    this.gridColumnApi.autoSizeColumns();
    if (
      this.gridColumnApi.columnController.bodyWidth >
      this.gridColumnApi.columnController.scrollWidth
    ) {
      this.gridColumnApi.autoSizeColumns();
    } else {
      this.gridApi.sizeColumnsToFit();
    }
  }

  getUserListCount() {
    this._subscriptions.push(
      this.userService.getUsersCount(this.filter).subscribe(resp => {
        this.totalUsersCount = resp['count'];
      }),
    );
  }

  sortUserList(resp) {
    if (resp.includes('none')) {
      const columnName = resp.substr(0, resp.indexOf(' ')).trim();
      this.orderFilter = this.orderFilter.filter(
        item => !item.includes(columnName),
      );
      this.getUserList(this.currentPage, this.itemsPerPage, this.filter);
    } else {
      this.orderFilter.push(resp);
      this.getUserList(this.currentPage, this.itemsPerPage, this.filter);
    }
  }

  paginationEvent(pageNo) {
    this.currentPage = pageNo;
    if (!this.isSearched) {
      this.form.reset();
    }
    this.getUserList(pageNo, this.itemsPerPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ng-select on select item
  onSelectChange() {
    const selectedElement = document.querySelector(
      'ng-select.ng-select-filtered',
    );
    if (selectedElement !== null) {
      selectedElement.classList.remove('ng-select-filtered');
    }
  }
  onClickImport() {
    this.csvDialogRef = this.dialogService.open(this.csvDropZone, {
      closeOnBackdropClick: false,
    });
  }

  onClickImportSample(event) {
    switch (Number(event)) {
      case RoleType.Administrator:
        window.open('/assets/csv-sample/importUser_Admin.csv', '_blank');
        break;
      case RoleType.superMSL:
        window.open('/assets/csv-sample/importUser_SponsorUser.csv', '_blank');
        break;
      case RoleType.hcp:
        window.open('/assets/csv-sample/importUser_HCP.csv', '_blank');
        break;
      default:
        // empty default statement.
        break;
    }
  }
  onClickTimezoneSample() {
    window.open('/assets/csv-sample/timezoneCSV.csv', '_blank');
  }

  onSelect(event) {
    this.csvFile = event.addedFiles;
    if (event.rejectedFiles && event.rejectedFiles.length > 0) {
      this.tostr.warning(
        'You can only import a .csv file.',
        'Invalid file type.',
        {
          timeOut: environment.messageTimeout,
        },
      );
    }
  }

  onRemove() {
    this.csvFile = null;
  }

  importUsers() {
    const formData = new FormData();
    formData.append('file', this.csvFile[0]);
    this.importLoading = true;
    this._subscriptions.push(
      this.userService.importUsers(formData).subscribe(resp => {
        if (resp) {
          this.importLoading = false;
          this.csvFile = null;
          this.csvDialogRef.close();
          this.getUserList(this.currentPage, this.itemsPerPage);
          this.tostr.success(
            'Users have been imported sucessfully.',
            'Success',
          );
        }
      }),
    );
  }

  unlockUser() {
    this.unlockLoading = true;
    const userToBeUnlocked = { userIds: [this.userId] };
    this._subscriptions.push(
      this.userService.unlockUser(userToBeUnlocked).subscribe(resp => {
        if (resp['success']) {
          this.unlockLoading = false;
          this.unlockTemplateSwitch = true;
          this.getUserList(this.currentPage, this.itemsPerPage);
        }
      }),
    );
  }
}
