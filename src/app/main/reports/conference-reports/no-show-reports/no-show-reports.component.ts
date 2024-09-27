import {
  Component,
  ViewChild,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {Role} from '@vmsl/core/store/models';
import {IVmslGridColumn} from '@vmsl/shared/vmsl-grid/wrapper-interfaces';
import {Subject} from 'rxjs';
import {NbDialogModule, NbDialogService} from '@nebular/theme';
import {ActivatedRoute} from '@angular/router';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {UserFacadeService} from '@vmsl/shared/facades/user-facade.service';
import {ToastrService} from 'ngx-toastr';
import {environment} from '@vmsl/env/environment';
import {Location} from '@angular/common';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {UserInfo} from '@vmsl/core/auth/models/user.model';
import {NoShowReport} from '../../shared/models/noshow-report-model';
import {ReportStatusType} from '../../shared/arrays/status-types';
import {ReportsService} from '../../shared/reports.service';
import {eventsColumnDefinition} from '../../shared/models/noshow-events-grid-headers';
import {columnDefinitions} from '../../shared/models/noshow-report-gird-headers';
import * as moment from 'moment';
import {pageLimitMaxHundred} from '@vmsl/shared/model/items-per-page-list';
import {RoleName, RoleType} from '@vmsl/core/enums/roles.enum';

@Component({
  selector: 'vmsl-no-show-reports',
  templateUrl: './no-show-reports.component.html',
  styleUrls: ['./no-show-reports.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NoShowReportsComponent extends RouteComponentBase {
  permissionKey = Permission;
  reportList: NoShowReport[];
  userPermissions: string[];
  users: UserInfo[];
  currentUserId: string;
  roles: Role[];
  reportStatus = ReportStatusType;
  loading = false;
  columnDefinition: IVmslGridColumn[];
  eventsColumnDefinition: IVmslGridColumn[];
  gridApi;
  gridColumnApi;
  dropdownCount: Subject<number> = new Subject<number>();
  itemsPerPage: number;
  currentPage = 1;
  totalUsersCount: number;
  totalReportsCount: number;
  totalDuration: number;
  currentRole: string;
  noRowsTemplate = '<span>No Reports Found</span>';
  itemsPerPageList = pageLimitMaxHundred;
  filter = {
    userId: null,
    fromDate: null,
    tillDate: null,
  };
  isSearched = false;
  orderFilter = [];
  @ViewChild('viewEventsDialog', {read: TemplateRef})
  viewEventsDialog: TemplateRef<NbDialogModule>;

  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly reportsService: ReportsService,
    private readonly sessionStore: UserSessionStoreService,
    private readonly userFacadeService: UserFacadeService,
    private readonly dialogService: NbDialogService,
    private readonly tostrService: ToastrService,
  ) {
    super(route, location);
  }

  ngOnInit() {
    super.ngOnInit();
    this.currentUserId = this.sessionStore.getUser().id;
    this.userPermissions = this.sessionStore.getUser().permissions;
    this.currentRole = this.sessionStore.getUser().role;
    if (this.userPermissions.includes('ViewTenantAudit')) {
      this.itemsPerPage = 10;
      this.getNoShowReports(1, this.itemsPerPage);
    }
    this.columnDefinition = columnDefinitions();
    this.eventsColumnDefinition = eventsColumnDefinition();
    this.filterUsersOnPermission();
    this._subscriptions.push(
      this.reportsService.viewNoShowEventsObv.subscribe(resp => {
        if (resp) {
          this.dialogService.open(this.viewEventsDialog, {
            closeOnBackdropClick: false,
            context: resp,
          });
          this.reportsService.setNoShowEvents(null);
        }
      }),
    );

    this._subscriptions.push(
      this.reportsService.noShowMeetingsSortObv.subscribe(resp => {
        if (resp) {
          this.sortReportsList(resp);
          this.reportsService.setNoShowMeetingstSort(null);
        }
      }),
    );
    this.filter.tillDate = moment().toISOString();
    this.filter.fromDate = moment().subtract(1, 'days').toISOString();
  }

  sortReportsList(resp) {
    this.orderFilter = this.orderFilter.filter(
      item => !item.includes(resp.columnName),
    );
    if (resp.sort !== 'none') {
      this.orderFilter.unshift(`${resp.columnName} ${resp.sort}`);
    }
    this.getNoShowReports(this.currentPage, this.itemsPerPage, this.filter);
  }

  onExportNoShowList(type: string) {
    this._subscriptions.push(
      this.reportsService
        .exportNoShowList(this.filter, type, this.orderFilter)
        .subscribe(resp => {
          const downloadLink = document.createElement('a');
          downloadLink.href = resp['fileUrl'];
          downloadLink.download = 'download';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }),
    );
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

  checkDateDiff(daysDiff, form) {
    const maxDaysDiff = 30;
    if (daysDiff > maxDaysDiff) {
      form.form.controls['fromDate']?.setErrors({invalid: true});
    } else if (form.form && form.form.controls['fromDate']?.invalid) {
      form.form.controls['fromDate']?.setErrors(null);
    } else {
      //empty else block
    }
  }

  getNoShowReports(pageNo, itemsPerPage, form?) {
    if (form) {
      this.loading = true;
      const daysDiff = moment(this.filter.tillDate).diff(
        this.filter.fromDate,
        'days',
        true,
      );
      this.checkDateDiff(daysDiff, form);
      if (form.invalid) {
        this.loading = false;
        return;
      }
    }
    if (!itemsPerPage) {
      const reportsPerPage = 10;
      itemsPerPage = reportsPerPage;
      this.itemsPerPage = reportsPerPage;
    }
    this._subscriptions.push(
      this.reportsService
        .getNoShowReports(pageNo, itemsPerPage, this.filter, this.orderFilter)
        .subscribe(
          resp => {
            if (resp.length > 0) {
              this.getNoShowReportsCount();
              this.reportList = resp;
              this.loading = false;
            } else {
              this.reportsService
                .getNoShowReports(
                  1,
                  itemsPerPage,
                  this.filter,
                  this.orderFilter,
                )
                .subscribe(res => {
                  this.getNoShowReportsCount();
                  this.reportList = res;
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

  getNoShowReportsCount() {
    this._subscriptions.push(
      this.reportsService.getNoShowReportsCount(this.filter).subscribe(resp => {
        this.totalReportsCount = resp['count'];
      }),
    );
  }
  sortUsersBasedOnFullName(users) {
    return users.sort((a, b) => a.fullName.localeCompare(b.fullName));
  }
  filterUsersOnPermission() {
    if (this.userPermissions.includes('ViewTenantAudit')) {
      const unverfiedHcp = 9;
      this._subscriptions.push(
        this.userFacadeService.getUserList().subscribe(resp => {
          const withoutAdmins = resp.filter(
            item =>
              item.roleType !== RoleType.Administrator &&
              item.roleType !== unverfiedHcp,
          );
          this.users = this.sortUsersBasedOnFullName(withoutAdmins);
        }),
      );
    } else if (this.userPermissions.includes('ViewTenantAuditDirector')) {
      this.reportsService.getLinkedUser(this.currentUserId).subscribe(res => {
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
      this.filter.userId = this.sessionStore.getUser().id;
      this.getNoShowReports(1, this.itemsPerPage, this.filter);
    } else {
      this.reportsService.getLinkedUser(this.currentUserId).subscribe(resp => {
        this.users = this.sortUsersBasedOnFullName(resp);
        this.filter.userId = this.sessionStore.getUser().id;
        this.getNoShowReports(1, this.itemsPerPage, this.filter);
      });
    }
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

  emitCountToChild() {
    this.dropdownCount.next(this.itemsPerPage);
  }

  onClearFilter(form) {
    this.isSearched = false;
    form.resetForm();
    if (this.userPermissions.includes('ViewTenantAudit')) {
      this.itemsPerPage = 10;
      this.emitCountToChild();
      this.getNoShowReports(1, this.itemsPerPage);
    } else {
      this.reportList = null;
    }
    this.currentPage = 1;
  }

  getPaginationValue(data) {
    this.itemsPerPage = data;
    const maxItemsPerPage = 100;
    if (this.itemsPerPage > maxItemsPerPage) {
      this.tostrService.info(
        'You cannot view more than 100 reports at a time.',
        'ATTENTION',
        {
          timeOut: environment.messageTimeout,
        },
      );
      this.itemsPerPage = 100;
      this.emitCountToChild();
    }
    this.getNoShowReports(this.currentPage, this.itemsPerPage);
  }

  paginationEvent(pageNo) {
    this.currentPage = pageNo;
    if (!this.isSearched) {
      this.filter.userId = null;
      this.filter.tillDate = moment().toISOString();
      this.filter.fromDate = moment().subtract(1, 'days').toISOString();
    }
    this.getNoShowReports(pageNo, this.itemsPerPage);
    window.scrollTo({top: 0, behavior: 'smooth'});
  }
}
