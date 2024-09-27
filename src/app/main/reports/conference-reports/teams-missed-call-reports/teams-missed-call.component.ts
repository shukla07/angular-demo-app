import {
  Component,
  ViewEncapsulation,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {Location} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {UserFacadeService} from '@vmsl/shared/facades/user-facade.service';
import {NbDialogService, NbDialogModule} from '@nebular/theme';
import {ToastrService} from 'ngx-toastr';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {Role} from '@vmsl/core/store/models';
import {IVmslGridColumn} from '@vmsl/shared/vmsl-grid/wrapper-interfaces';
import {Subject} from 'rxjs';
import {UserInfo} from '@vmsl/core/auth/models/user.model';
import {environment} from '@vmsl/env/environment';
import {Report} from '../../shared/models/report-model';
import {ReportStatusType} from '../../shared/arrays/status-types';
import {ReportsService} from '../../shared/reports.service';
import {columnDefinitions} from '../../shared/models/team-missedcalls-report-grid-headers';
import * as moment from 'moment';
import {usersColumnDefinition} from '../../shared/models/missedcalls-users-grid-headers';
import {pageLimitMaxHundred} from '@vmsl/shared/model/items-per-page-list';
import {RoleName, RoleType} from '@vmsl/core/enums/roles.enum';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'vmsl-teams-missed-call',
  templateUrl: './teams-missed-call.component.html',
  styleUrls: ['./teams-missed-call.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TeamsMissedCallComponent extends RouteComponentBase {
  permissionKey = Permission;
  reportList: Report[];
  userPermissions: string[];
  users: UserInfo[];
  currentUserId: string;
  roles: Role[];
  reportStatus = ReportStatusType;
  loading = false;
  columnDefinition: IVmslGridColumn[];
  usersColumnDefinition: IVmslGridColumn[];
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
  @ViewChild('viewRequestedUsersDialog', {read: TemplateRef})
  viewRequestedUsersDialog: TemplateRef<NbDialogModule>;
  @ViewChild('form') form: NgForm;

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
      this.getTeamsMissedCallReports(1, this.itemsPerPage);
    }
    this.columnDefinition = columnDefinitions();
    this.usersColumnDefinition = usersColumnDefinition();
    this.filterUsersOnPermission();
    this._subscriptions.push(
      this.reportsService.viewRequestedUsersObv.subscribe(resp => {
        if (resp) {
          this.dialogService.open(this.viewRequestedUsersDialog, {
            closeOnBackdropClick: false,
            context: resp,
          });
          this.reportsService.setRequestedUsers(null);
        }
      }),
    );

    this._subscriptions.push(
      this.reportsService.missedTeamMeetingsSortObv.subscribe(resp => {
        if (resp) {
          this.sortReportsList(resp);
          this.reportsService.setTeamMissedMeetingstSort(null);
        }
      }),
    );
    this.filter.tillDate = moment().toISOString();
    this.filter.fromDate = moment().subtract(1, 'days').toISOString();
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

  sortReportsList(resp) {
    this.orderFilter = this.orderFilter.filter(
      item => !item.includes(resp.columnName),
    );
    if (resp.sort !== 'none') {
      this.orderFilter.unshift(`${resp.columnName} ${resp.sort}`);
    }
    this.getTeamsMissedCallReports(
      this.currentPage,
      this.itemsPerPage,
      this.filter,
    );
  }

  onExportMissedCallList(type: string) {
    this._subscriptions.push(
      this.reportsService
        .exportMissedCallList(this.filter, type, this.orderFilter)
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

  getTeamsMissedCallReports(pageNo, itemsPerPage, form?) {
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
        .getTeamsMissedCallReports(
          pageNo,
          itemsPerPage,
          this.filter,
          this.orderFilter,
        )
        .subscribe(
          resp => {
            if (resp.length > 0) {
              this.getTeamsMissedCallReportsCount();
              this.reportList = resp;
              this.loading = false;
            } else {
              this.reportsService
                .getTeamsMissedCallReports(
                  1,
                  itemsPerPage,
                  this.filter,
                  this.orderFilter,
                )
                .subscribe(res => {
                  this.getTeamsMissedCallReportsCount();
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

  getTeamsMissedCallReportsCount() {
    this._subscriptions.push(
      this.reportsService
        .getTeamsMissedCallReportsCount(this.filter)
        .subscribe(resp => {
          this.totalReportsCount = resp['count'];
        }),
    );
  }

  filterUsersOnPermission() {
    if (
      this.userPermissions.includes('ViewTenantAudit') ||
      this.userPermissions.includes('ViewTenantAuditDirector')
    ) {
      this._subscriptions.push(
        this.userFacadeService.getUserList().subscribe(resp => {
          const onlyMl = resp.filter(item => item.roleType === RoleType.msl);
          this.users = onlyMl.sort((a, b) =>
            a.fullName.localeCompare(b.fullName),
          );
        }),
      );
    } else {
      this.reportsService.getLinkedUser(this.currentUserId).subscribe(resp => {
        const onlyMl = resp.filter(
          item =>
            item.roleName === RoleName.msl ||
            parseInt(item.role) === RoleType.msl,
        );
        if (onlyMl.length > 0) {
          this.users = onlyMl.sort((a, b) =>
            a.fullName.localeCompare(b.fullName),
          );
          const userId = this.users.find(
            item => item.id === this.sessionStore.getUser().id,
          );
          this.filter.userId = userId ? userId.id : this.users[0].id;
          this.getTeamsMissedCallReports(1, this.itemsPerPage, this.filter);
        } else {
          this.tostrService.warning(
            `No user is assigned to the current user, can't fetch reports.`,
            'ATTENTION',
            {
              timeOut: environment.messageTimeout,
            },
          );
        }
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
    form.resetForm();
    this.isSearched = false;
    if (this.userPermissions.includes('ViewTenantAudit')) {
      this.itemsPerPage = 10;
      this.emitCountToChild();
      this.getTeamsMissedCallReports(1, this.itemsPerPage);
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
    this.getTeamsMissedCallReports(this.currentPage, this.itemsPerPage);
  }

  paginationEvent(pageNo) {
    this.currentPage = pageNo;
    if (!this.isSearched) {
      this.filter.userId = null;
      this.filter.tillDate = moment().toISOString();
      this.filter.fromDate = moment().subtract(1, 'days').toISOString();
    }
    this.getTeamsMissedCallReports(pageNo, this.itemsPerPage);
    window.scrollTo({top: 0, behavior: 'smooth'});
  }
}
