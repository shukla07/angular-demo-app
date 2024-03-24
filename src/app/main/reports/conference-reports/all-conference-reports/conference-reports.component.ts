import {
  Component,
  ViewEncapsulation,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {Location} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {ReportsService} from '../../shared/reports.service';
import {Report} from '../../shared/models/report-model';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {IVmslGridColumn} from '@vmsl/shared/vmsl-grid/wrapper-interfaces';
import {Subject} from 'rxjs';
import {UserInfo} from '@vmsl/core/auth/models/user.model';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {UserFacadeService} from '@vmsl/shared/facades/user-facade.service';
import {TeamInfo} from '../../../teams-management/shared/models/team-info.model';
import {Role} from '@vmsl/core/store/models';
import {SystemStoreFacadeService} from '@vmsl/core/store/system-store-facade.service';
import {ReportStatusType} from '../../shared/arrays/status-types';
import {NbDialogModule, NbDialogService} from '@nebular/theme';
import {ToastrService} from 'ngx-toastr';
import {environment} from '@vmsl/env/environment';
import {columnDefinitions} from '../../shared/models/conference-report-grid-headers';
import * as moment from 'moment';
import {RoleName, RoleType} from '@vmsl/core/enums/roles.enum';
import {pageLimitMaxHundred} from '@vmsl/shared/model/items-per-page-list';
import {CallType} from '../../shared/arrays/call-types';
import {EventTypes} from '../../shared/arrays/event-types';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'vmsl-conference-reports',
  templateUrl: './conference-reports.component.html',
  styleUrls: ['./conference-reports.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ConferenceReportsComponent extends RouteComponentBase {
  permissionKey = Permission;
  reportList: Report[];
  userPermissions: string[];
  users: UserInfo[];
  teamsNameList: TeamInfo[];
  currentUserId: string;
  roles: Role[];
  callTypes = CallType;
  eventTypes = EventTypes;
  reportStatus = ReportStatusType;
  loading = false;
  columnDefinition: IVmslGridColumn[];
  gridApi;
  gridColumnApi;
  dropdownCount: Subject<number> = new Subject<number>();
  itemsPerPage: number;
  currentPage = 1;
  totalUsersCount: number;
  totalReportsCount: number;
  totalDuration: string;
  currentRole: string;
  noRowsTemplate = '<span>No Reports Found</span>';
  itemsPerPageList = pageLimitMaxHundred;
  filter = {
    organizer: null,
    createdBy: null,
    userId: null,
    teamId: null,
    userRole: null,
    callType: null,
    eventType: null,
    fromDate: '',
    tillDate: '',
    status: null,
  };
  isSearched = false;
  orderFilter = [];
  @ViewChild('viewReportDialog', {read: TemplateRef})
  viewReportDialog: TemplateRef<NbDialogModule>;
  @ViewChild('form') form: NgForm;

  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly reportsService: ReportsService,
    private readonly sessionStore: UserSessionStoreService,
    private readonly userFacadeService: UserFacadeService,
    private readonly systemStore: SystemStoreFacadeService,
    private readonly dialogService: NbDialogService,
    private readonly tostrService: ToastrService,
  ) {
    super(route, location);
  }

  ngOnInit() {
    super.ngOnInit();
    this.currentUserId = this.sessionStore.getUser().id;
    this.userPermissions = this.sessionStore.getUser().permissions;
    this.getRoles();
    this.currentRole = this.sessionStore.getUser().role;
    if (this.userPermissions.includes('ViewTenantAudit')) {
      this.itemsPerPage = 10;
      this.getReports(1, this.itemsPerPage);
    }
    this.columnDefinition = columnDefinitions();
    this.filterUsersOnPermission();
    this.getTeamNamesForFilter();
    this._subscriptions.push(
      this.reportsService.viewReportObv.subscribe(resp => {
        if (resp) {
          this.dialogService.open(this.viewReportDialog, {
            closeOnBackdropClick: false,
            context: resp,
          });
          this.reportsService.setReportInfo(null);
        }
      }),
    );

    this._subscriptions.push(
      this.reportsService.allMeetingsSortObv.subscribe(resp => {
        if (resp) {
          this.sortReportsList(resp);
          this.reportsService.setAllMeetingstSort(null);
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
    this.getReports(this.currentPage, this.itemsPerPage, this.filter);
  }

  onExportConferenceList(type: string) {
    this._subscriptions.push(
      this.reportsService
        .exportConferenceList(this.filter, type, this.orderFilter)
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

  getRoles() {
    this.systemStore.getRoles().subscribe(resp => {
      this.roles = resp.filter(
        item => item.roleType !== RoleType.Administrator,
      );
    });
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

  getReports(pageNo, itemsPerPage, form?) {
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
        .getReports(pageNo, itemsPerPage, this.filter, this.orderFilter)
        .subscribe(
          resp => {
            if (resp.length > 0) {
              this.getReportsCount();
              this.reportList = resp;
              this.getSumOfDuration(resp);
              this.loading = false;
            } else {
              this.reportsService
                .getReports(1, itemsPerPage, this.filter, this.orderFilter)
                .subscribe(res => {
                  this.getReportsCount();
                  this.reportList = res;
                  this.getSumOfDuration(res);
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

  getReportsCount() {
    this._subscriptions.push(
      this.reportsService.getReportsCount(this.filter).subscribe(resp => {
        this.totalReportsCount = resp['count'];
      }),
    );
  }
  sortUsersBasedOnFullName(users) {
    return users.sort((a, b) => a.fullName.localeCompare(b.fullName));
  }
  filterUsersOnPermission() {
    if (this.userPermissions.includes('ViewTenantAudit')) {
      this._subscriptions.push(
        this.userFacadeService.getUserList().subscribe(resp => {
          const withoutAdmins = resp.filter(
            item => item.roleType !== RoleType.Administrator,
          );
          this.users = withoutAdmins.sort((a, b) =>
            a.fullName.localeCompare(b.fullName),
          );
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
      this.getReports(1, this.itemsPerPage, this.filter);
    } else {
      this.reportsService.getLinkedUser(this.currentUserId).subscribe(resp => {
        this.users = resp.sort((a, b) => a.fullName.localeCompare(b.fullName));
        this.filter.userId = this.sessionStore.getUser().id;
        this.getReports(1, this.itemsPerPage, this.filter);
      });
    }
  }

  getTeamNamesForFilter() {
    this._subscriptions.push(
      this.reportsService.getTeamsList().subscribe(resp => {
        this.teamsNameList = [];
        resp.forEach(element => {
          this.teamsNameList.push(element);
          this.teamsNameList.sort((a, b) =>
            a.teamName.localeCompare(b.teamName),
          );
        });
      }),
    );
  }

  getSumOfDuration(reportData: Report[]) {
    const thousand = 1000;
    const totalDurationInSeconds = reportData.reduce(
      (ele1, ele2) => ele1 + moment.duration(ele2.duration).asSeconds(),
      0,
    );
    this.totalDuration = moment
      .utc(totalDurationInSeconds * thousand)
      .format('HH:mm:ss');
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
      this.getReports(1, this.itemsPerPage);
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
    this.getReports(this.currentPage, this.itemsPerPage);
  }

  paginationEvent(pageNo) {
    this.currentPage = pageNo;
    if (!this.isSearched) {
      this.form.reset();
      this.filter.tillDate = moment().toISOString();
      this.filter.fromDate = moment().subtract(1, 'days').toISOString();
    }
    this.getReports(pageNo, this.itemsPerPage);
    window.scrollTo({top: 0, behavior: 'smooth'});
  }
}
