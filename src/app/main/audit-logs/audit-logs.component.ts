import {
  Component,
  ViewEncapsulation,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { RouteComponentBase } from '@vmsl/core/route-component-base';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Permission } from '@vmsl/core/auth/permission-key.enum';
import { UserInfo } from '@vmsl/core/auth/models/user.model';
import { UserFacadeService } from '@vmsl/shared/facades/user-facade.service';
import { UserSessionStoreService } from '@vmsl/core/store/user-session-store.service';
import { IVmslGridColumn } from '@vmsl/shared/vmsl-grid/wrapper-interfaces';
import { columnDefinitions } from './shared/models/auditlogs-grid-headers';
import { diffColumnDefinitions } from './shared/models/auditlogs-diff-grid-headers';
import { Subject } from 'rxjs';
import { NbDialogModule, NbDialogRef, NbDialogService } from '@nebular/theme';
import { NgxObjectDiffService } from 'ngx-object-diff';
import { AuditLogs } from './shared/models/audit-logs.model';
import { AuditLogsService } from './shared/audit-logs.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '@vmsl/env/environment';
import { pageLimitMaxThousand } from '@vmsl/shared/model/items-per-page-list';
import * as moment from 'moment';
import { NgForm } from '@angular/forms';
import { RoleName, RoleType } from '@vmsl/core/enums';
import { AuditLogsDifferences } from './shared/models/auditlogs-diff.model';

@Component({
  selector: 'vmsl-audit-logs',
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AuditLogsComponent extends RouteComponentBase {
  permissionKey = Permission;
  users: UserInfo[];
  loading = false;
  userPermissions: string[];
  logTypes: Object[];
  currentUserId: string;
  currentRole: string;
  auditLogs: AuditLogs[];
  columnDefinition: IVmslGridColumn[];
  filter = {
    userTenantId: null,
    logType: null,
    dateFrom: '',
    dateTo: '',
    timezone: false,
  };
  isSearched = false;
  gridApi;
  gridColumnApi;
  dropdownCount: Subject<number> = new Subject<number>();
  itemsPerPage: number;
  currentPage = 1;
  totalUsersCount: number;
  noRowsTemplate = '<span>No Logs Found</span>';
  @ViewChild('viewOperatorDialog', { read: TemplateRef })
  viewOperatorDialog: TemplateRef<NbDialogModule>;
  viewOperatorDialogRef: NbDialogRef<NbDialogModule>;
  @ViewChild('viewLogsChangeDialog', { read: TemplateRef })
  viewLogsChangeDialog: TemplateRef<NbDialogModule>;
  viewLogsChangeDialogRef: NbDialogRef<NbDialogModule>;
  @ViewChild('viewOperationTimeDialog', { read: TemplateRef })
  viewOperationTimeDialog: TemplateRef<NbDialogModule>;
  viewOperationTimeDialogRef: NbDialogRef<NbDialogModule>;
  @ViewChild('form') form: NgForm;
  user: UserInfo;
  userName: string;
  gridRender: boolean;
  selectedRows: string[];
  itemsPerPageList = pageLimitMaxThousand;
  operationTime: string;
  auditLogDiff: AuditLogsDifferences[];
  diffColumnDefinition: IVmslGridColumn[];
  hiddenDiffProperties = ['config_value', 'ext_metadata', 'request_body_event'];
  dateFormat = 'DD/MM/YYYY, HH:mm:ss A';
  logViewUserName: string;
  auditLogPDFBtn = false;

  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly userFacadeService: UserFacadeService,
    private readonly sessionStore: UserSessionStoreService,
    private readonly auditLogsService: AuditLogsService,
    private readonly store: UserSessionStoreService,
    private readonly dialogService: NbDialogService,
    private readonly objectDiff: NgxObjectDiffService,
    private readonly tostrService: ToastrService,
  ) {
    super(route, location);
  }

  ngOnInit() {
    super.ngOnInit();
    this.auditLogPDFBtn = this.store.getAuditLogPDFStatus();
    this.userPermissions = this.sessionStore.getUser().permissions;
    this._subscriptions.push(
      this.auditLogsService.getAuditLogsType().subscribe(resp => {
        this.logTypes = this.sortLogTypes(resp);
      }),
    );
    this._subscriptions.push(
      this.auditLogsService.viewOperatorObv.subscribe(resp => {
        if (resp) {
          this.toOpenOperatorDialog(resp);
          this.auditLogsService.setUserTenantId(null);
        }
      }),
    );
    this._subscriptions.push(
      this.auditLogsService.viewLogsChanges.subscribe(resp => {
        if (resp) {
          this.toOpenDiffDialog(resp);
          this.auditLogsService.setChangesFromLogs(null);
          this.diffColumnDefinition = diffColumnDefinitions();
        }
      }),
    );
    this._subscriptions.push(
      this.auditLogsService.operationTimeObv.subscribe(resp => {
        if (resp) {
          this.toOpenOperationTimeDialog(resp);
          this.auditLogsService.setOperationTime(null);
        }
      }),
    );
    this.currentUserId = this.store.getUser().id;
    this.currentRole = this.store.getUser().role;
    this.filterUsersOnPermission();
    this.columnDefinition = columnDefinitions();
    if (this.currentRole === '4') {
      this.itemsPerPage = 10;
      this.getAuditLogs(1, this.itemsPerPage);
    }
    const eightHours = 8;
    this.filter.dateTo = moment().toISOString();
    this.filter.dateFrom = moment().subtract(eightHours, 'hours').toISOString();
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.setDomLayout('autoHeight');
    this.autoSizeColumn();
  }

  autoSizeColumn() {
    this.gridColumnApi.autoSizeColumns();
    if (
      this.gridColumnApi.columnController.bodyWidth >
      this.gridColumnApi.columnController.scrollWidth
    ) {
      this.gridColumnApi.autoSizeAllColumns();
    } else {
      this.gridApi.sizeColumnsToFit();
    }
  }

  getAuditLogs(page, itemsPerPage, form?) {
    if (form) {
      this.loading = true;
      const daysDiff = moment(this.filter.dateTo).diff(
        this.filter.dateFrom,
        'days',
        true,
      );
      this.checkDateDiff(daysDiff, form);
      if (form.invalid) {
        form.form.controls['username'].markAsTouched();
        this.loading = false;
        return;
      }
    }
    if (!itemsPerPage) {
      const logsPerPage = 10;
      itemsPerPage = logsPerPage;
      this.itemsPerPage = logsPerPage;
    }
    this._subscriptions.push(
      this.auditLogsService
        .getAuditLogs(page, itemsPerPage, this.filter)
        .subscribe(
          resp => {
            if (resp.length > 0) {
              this.getAuditLogsCount();
              this.auditLogs = resp;
              this.loading = false;
            } else {
              this.auditLogsService
                .getAuditLogs(1, itemsPerPage, this.filter)
                .subscribe(res => {
                  this.getAuditLogsCount();
                  this.auditLogs = res;
                  this.loading = false;
                });
              this.currentPage = 1;
            }
          },
          err => {
            this.loading = false;
          },
        ),
    );
  }

  getAuditLogsCount() {
    this._subscriptions.push(
      this.auditLogsService.getAuditLogsCount(this.filter).subscribe(resp => {
        this.totalUsersCount = resp['count'];
      }),
    );
  }

  sortLogTypes(data)
  {
    return (data.sort((a, b) => (a.localeCompare(b))));
  }

  sortUsersBasedOnFullName(data)
  {
    return (data.sort((a, b) => (a.fullName.localeCompare(b.fullName))));
  }



  filterUsersOnPermission() {
    if (this.userPermissions.includes('ViewTenantAudit')) {
      this._subscriptions.push(
        this.userFacadeService.getUserList().subscribe(resp => {
          this.users = this.sortUsersBasedOnFullName(resp);
        }),
      );
    } else if (this.userPermissions.includes('ViewTenantAuditDirector')) {
      this.auditLogsService.getLinkedUser(this.currentUserId).subscribe(res => {
        const linkedUsers = res.map(user => user.userTenantId);
        this.userFacadeService.getUserList().subscribe(resp => {
          this.users = resp.filter(
            user =>
              (user.role !== RoleName.hcp &&
                user.roleType !== RoleType.jrHcp) ||
              linkedUsers.includes(user.userTenantId),
          );
          this.users = this.sortUsersBasedOnFullName(this.users);
        });
      });
      this.filter.userTenantId = this.store.getUser().userTenantId;
      this.getAuditLogs(1, this.itemsPerPage, this.filter);
    } else {
      this.auditLogsService
        .getLinkedUser(this.currentUserId)
        .subscribe(resp => {
          this.users = this.sortUsersBasedOnFullName(resp);
          this.filter.userTenantId = this.store.getUser().userTenantId;
          this.getAuditLogs(1, this.itemsPerPage, this.filter);
        });
    }
  }

  onClearFilter(form) {
    form.resetForm();
    this.isSearched = false;
    if (this.currentRole === '4') {
      this.itemsPerPage = 10;
      this.emitCountToChild();
      this.getAuditLogs(1, this.itemsPerPage);
    } else {
      this.auditLogs = null;
    }
  }

  toOpenDiffDialog(resp) {
    this.logViewUserName = resp['username'];
    const before = resp['before'] !== 'N/A' ? JSON.parse(resp['before']) : null;
    const after = resp['after'] !== 'N/A' ? JSON.parse(resp['after']) : null;
    const isSoftDelete = resp['operationName'] === 'SOFT-DELETE' ? true : false;
    const isUpdate = resp['operationName'] === 'UPDATE' ? true : false;
    this.auditLogDiff = [];
    if ((before || isSoftDelete) && !isUpdate) {
      const diff = this.objectDiff.diff(before, before);
      this.dataWhenInsertOrDelete(diff.value, false);
    }
    if (after && !isSoftDelete && !isUpdate) {
      const diff = this.objectDiff.diff(after, after);
      this.dataWhenInsertOrDelete(diff.value, true);
    }
    if (before && after && isUpdate && !isSoftDelete) {
      const diff = this.objectDiff.diff(before, after);
      this.diffDataWhenUpdate(diff.value);
    }
    this.open(this.viewLogsChangeDialog);
  }

  diffDataWhenUpdate(data) {
    for (const property in data) {
      if (
        data[property].changed === 'primitive change' &&
        !this.hiddenDiffProperties.includes(property)
      ) {
        this.auditLogDiff.push({
          property: property,
          before:
            property === 'modified_on'
              ? moment(data[property].removed).format(this.dateFormat)
              : data[property].removed,
          after:
            property === 'modified_on'
              ? moment(data[property].added).format(this.dateFormat)
              : data[property].added,
        });
      }
    }
  }

  dataWhenInsertOrDelete(data, isInsert) {
    if (isInsert) {
      for (const property in data) {
        this.getInsertedValues(data, property);
      }
    } else {
      for (const property in data) {
        this.getDeletedValues(data, property);
      }
    }
  }

  getInsertedValues(data, property) {
    if (!this.hiddenDiffProperties.includes(property)) {
      this.auditLogDiff.push({
        property: property,
        before: '-',
        after:
          property === 'modified_on' || property === 'created_on'
            ? moment(data[property]).format(this.dateFormat)
            : data[property],
      });
    }
  }

  getDeletedValues(data, property) {
    if (!this.hiddenDiffProperties.includes(property)) {
      this.auditLogDiff.push({
        property: property,
        before:
          property === 'modified_on' || property === 'created_on'
            ? moment(data[property]).format(this.dateFormat)
            : data[property],
        after: '-',
      });
    }
  }

  toOpenOperatorDialog(resp) {
    this.auditLogsService.getUserByTenantId(resp).subscribe(userInfo => {
      if (userInfo.length) {
        this.user = userInfo[0];
        this.open(this.viewOperatorDialog);
        this.auditLogsService.setUserTenantId(null);
      } else {
        this.tostrService.info(
          'Either this operation has been carried by the system or the user has been removed.',
          'ATTENTION',
          {
            timeOut: environment.messageTimeout,
          },
        );
      }
    });
  }

  toOpenOperationTimeDialog(data) {
    if (data.userId === this.store.getUser().userTenantId) {
      this.userName = `${this.store.getUser().firstName} ${this.store.getUser().lastName
        }`;
    } else {
      this.users.forEach(user => {
        if (user.userTenantId === data.userId) {
          this.userName = user.fullName;
        }
      });
    }
    this.operationTime = data.operationTime;
    this.open(this.viewOperationTimeDialog);
  }

  open(dialog: TemplateRef<NbDialogModule>) {
    this.dialogService.open(dialog, {
      closeOnBackdropClick: false,
    });
  }

  emitCountToChild() {
    this.dropdownCount.next(this.itemsPerPage);
  }

  getPaginationValue(data) {
    this.itemsPerPage = data;
    this.getAuditLogs(this.currentPage, data);
  }

  paginationEvent(pageNo) {
    this.currentPage = pageNo;
    if (!this.isSearched) {
      const eightHours = 8;
      this.filter.dateTo = moment().toISOString();
      this.filter.dateFrom = moment()
        .subtract(eightHours, 'hours')
        .toISOString();
    }
    this.getAuditLogs(pageNo, this.itemsPerPage, this.filter);
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

  onExportUserList(exportType: string) {
    const thousandRecords = 1000;
    if (exportType === 'PDF' && this.totalUsersCount > thousandRecords) {
      this.tostrService.error(
        'You can export only 1000 records as PDF at once.',
        'Error',
        {
          timeOut: environment.messageTimeout,
        },
      );
      return;
    }
    const maxDaysDiff = 30;
    const daysDiff = moment(this.filter.dateTo).diff(
      this.filter.dateFrom,
      'days',
      true,
    );
    if (daysDiff > maxDaysDiff) {
      this.tostrService.error(
        'Gap between From & To date cannot be more than one month.',
        'Error',
        {
          timeOut: environment.messageTimeout,
        },
      );
      return;
    }
    this._subscriptions.push(
      this.auditLogsService
        .exportAuditLogs(this.filter, exportType)
        .subscribe(resp => {
          if (resp['fileInProgress']) {
            const oneSecond = 1000;
            this.auditLogPDFBtn = true;
            this.store.setAuditLogPDFStatus(true);
            const interval = setInterval(() => {
              if (!this.store.getAuditLogPDFStatus()) {
                this.auditLogPDFBtn = false;
                clearInterval(interval);
              }
            }, oneSecond);
            this.tostrService.info(
              'The Download is in progress, the PDF will be downloaded once completed',
              'INFO',
              {
                timeOut: environment.messageTimeout,
              },
            );
          }
          if (resp['fileUrl']) {
            const downloadLink = document.createElement('a');
            downloadLink.href = resp['fileUrl'];
            downloadLink.download = 'download';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
          }
        }),
    );
  }
  checkDateDiff(daysDiff, form) {
    const maxDaysDiff = 30;
    if (daysDiff > maxDaysDiff) {
      form.form.controls['dateFrom']?.setErrors({ invalid: true });
    } else if (form.form && form.form.controls['dateFrom']?.invalid) {
      form.form.controls['dateFrom']?.setErrors(null);
    } else {
      //empty else block
    }
  }
}
