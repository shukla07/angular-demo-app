import { Location } from '@angular/common';
import {
  Component,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NbDialogModule, NbDialogService } from '@nebular/theme';
import { NgSelectComponent } from '@ng-select/ng-select';
import { UserInfo } from '@vmsl/core/auth/models/user.model';
import { RoleName, RoleType } from '@vmsl/core/enums';
import { RouteComponentBase } from '@vmsl/core/route-component-base';
import { UserSessionStoreService } from '@vmsl/core/store/user-session-store.service';
import { environment } from '@vmsl/env/environment';
import { DiseaseAreasService } from '@vmsl/shared/facades/disease-areas.service';
import { TerritoryManagementService } from '@vmsl/shared/facades/territory-management.service';
import { TherapeuticAreasService } from '@vmsl/shared/facades/therapeutic-areas.service';
import { UserFacadeService } from '@vmsl/shared/facades/user-facade.service';
import { pageLimitMaxHundred } from '@vmsl/shared/model/items-per-page-list';
import { IVmslGridColumn } from '@vmsl/shared/vmsl-grid/wrapper-interfaces';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { DiseaseArea } from '../../../disease-areas/shared/models/disease-area-info.model';
import { TeamInfo } from '../../../teams-management/shared/models/team-info.model';
import { Territory } from '../../../territories-management/shared/models/territory-info.model';
import { TherapeuticArea } from '../../../therapeutic-areas-management/shared/models/therapeutic-area-info.model.ts';
import { CallStatus } from '../../shared/arrays/call-status';
import { columnDefinitions } from '../../shared/models/mod-reports-grid-headers';
import { ModReports } from '../../shared/models/mod-reports-model';
import { ReportsService } from '../../shared/reports.service';

@Component({
  selector: 'vmsl-mod-reports',
  templateUrl: './mod-reports.component.html',
  styleUrls: ['./mod-reports.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ModReportsComponent extends RouteComponentBase {
  modReportList: ModReports[];
  userPermissions: string[];
  requestors: UserInfo[];
  territories: Territory[];
  therapeuticAreas: TherapeuticArea[];
  diseaseAreas: DiseaseArea[];
  teamsNameList: TeamInfo[];
  jobTitles: Object[];
  callStatus = CallStatus;
  currentUserId: string;
  loading = false;
  columnDefinition: IVmslGridColumn[];
  gridApi;
  gridColumnApi;
  dropdownCount: Subject<number> = new Subject<number>();
  itemsPerPage: number;
  currentPage = 1;
  totalReportsCount: number;
  noRowsTemplate = '<span>No Reports Found</span>';
  itemsPerPageList = pageLimitMaxHundred;
  filter = {
    requestorId: [],
    fromDate: null,
    tillDate: null,
    jobTitles: [],
    hcpOrPayor: null,
    territories: [],
    therapeuticAreas: [],
    diseaseAreas: [],
    teams: [],
    callStatus: null,
    timezone: null,
  };
  isSearched = false;
  orderFilter = [];
  @ViewChild('viewModReportDialog', { read: TemplateRef })
  viewModReportDialog: TemplateRef<NbDialogModule>;
  @ViewChild('form') form: NgForm;

  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly reportsService: ReportsService,
    private readonly sessionStore: UserSessionStoreService,
    private readonly userFacadeService: UserFacadeService,
    private readonly dialogService: NbDialogService,
    private readonly tostrService: ToastrService,
    private readonly territoriesService: TerritoryManagementService,
    private readonly therapeuticAreasService: TherapeuticAreasService,
    private readonly diseaseAreasService: DiseaseAreasService,
  ) {
    super(route, location);
  }

  ngOnInit() {
    super.ngOnInit();
    if (
      parseInt(this.sessionStore.getUser().role) === RoleType.superMSL ||
      parseInt(this.sessionStore.getUser().role) === RoleType.msl
    ) {
      this.filter.requestorId.push(this.sessionStore.getUser().id);
    }
    this.currentUserId = this.sessionStore.getUser().id;
    this.userPermissions = this.sessionStore.getUser().permissions;
    this.columnDefinition = columnDefinitions();
    this.filter.tillDate = moment().toISOString();
    this.filter.fromDate = moment().subtract(1, 'days').toISOString();
    if (
      this.userPermissions.includes('ViewTenantAudit') ||
      this.userPermissions.includes('ViewTenantAuditDirector')
    ) {
      this.getReports(1, this.itemsPerPage);
    }
    this.filterUsersOnPermission();
    this.getJobTitles();
    this.getTerritories();
    this.getTherapeuticAreas();
    this.getDiseaseAreas();
    this.getTeamNamesForFilter();
    this._subscriptions.push(
      this.reportsService.viewModReportObv.subscribe(resp => {
        if (resp) {
          this.dialogService.open(this.viewModReportDialog, {
            closeOnBackdropClick: false,
            context: resp,
          });
          this.reportsService.setModReportsInfo(null);
        }
      }),
    );

    this._subscriptions.push(
      this.reportsService.modReportsSortObv.subscribe(resp => {
        if (resp) {
          this.sortReportsList(resp);
          this.reportsService.setModReportsSort(null);
        }
      }),
    );
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

  onExportModReportsAsCSV(allRequestor) {
    this.filter.timezone = this.sessionStore.getUser().timeZone;
    let allRequestors = [];
    if (
      Number(this.sessionStore.getUser().role) !== RoleType.Administrator &&
      allRequestor &&
      !this.filter.requestorId.length
    ) {
      allRequestors = allRequestor.items.map(user => user.id);
    }
    this._subscriptions.push(
      this.reportsService
        .exportModReports(this.filter, this.orderFilter, allRequestors)
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
    this.gridColumnApi.autoSizeAllColumns();
    if (
      this.gridColumnApi.columnController.bodyWidth >
      this.gridColumnApi.columnController.scrollWidth
    ) {
      this.gridColumnApi.autoSizeColumns();
    } else {
      this.gridApi.sizeColumnsToFit();
    }
  }

  checkDateDiff(daysDiff, form) {
    const maxDaysDiff = 30;
    if (daysDiff > maxDaysDiff) {
      form.form.controls['fromDate']?.setErrors({ invalid: true });
    } else if (form.form && form.form.controls['fromDate']?.invalid) {
      form.form.controls['fromDate']?.setErrors(null);
    } else {
      //empty else block
    }
  }

  getReports(pageNo, itemsPerPage, form?, allRequestor?: NgSelectComponent) {
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
    let allRequestors = [];
    if (
      Number(this.sessionStore.getUser().role) !== RoleType.Administrator &&
      allRequestor &&
      !this.filter.requestorId.length
    ) {
      allRequestors = allRequestor.items.map(user => user.id);
    }
    this._subscriptions.push(
      this.reportsService
        .getModReportsList(
          pageNo,
          itemsPerPage,
          this.filter,
          this.orderFilter,
          allRequestors,
        )
        .subscribe(
          resp => {
            if (resp.length > 0) {
              this.modReportList = resp;
              this.getReportsCount();
              this.loading = false;
            } else {
              this.reportsService
                .getModReportsList(
                  1,
                  itemsPerPage,
                  this.filter,
                  this.orderFilter,
                )
                .subscribe(res => {
                  this.modReportList = res;
                  this.getReportsCount();
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
      this.reportsService.getModReportsCount(this.filter).subscribe(resp => {
        this.totalReportsCount = resp['count'];
      }),
    );
  }

  getJobTitles() {
    this._subscriptions.push(
      this.userFacadeService.getJobTitles().subscribe(resp => {
        this.jobTitles = resp;
      }),
    );
  }

  getTerritories() {
    this._subscriptions.push(
      this.territoriesService.getTerritoriesFiltered().subscribe(resp => {
        this.territories = resp;
      }),
    );
  }

  getTherapeuticAreas() {
    this._subscriptions.push(
      this.therapeuticAreasService
        .getTherapeuticAreasFiltered()
        .subscribe(resp => {
          this.therapeuticAreas = resp;
        }),
    );
  }

  getDiseaseAreas() {
    this._subscriptions.push(
      this.diseaseAreasService.getDiseaseAreasFiltered().subscribe(resp => {
        this.diseaseAreas = resp;
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
          const requestors = resp.filter(
            item =>
              item.roleType !== RoleType.hcp &&
              item.roleType !== RoleType.Administrator &&
              item.roleType !== RoleType.jrHcp,
          );
          this.requestors = requestors.sort((a, b) =>
            a.fullName.localeCompare(b.fullName),
          );
        }),
      );
    } else {
      this.reportsService.getLinkedUser(this.currentUserId).subscribe(resp => {
        this.requestors = resp.filter(item => {
          if (item.roleName !== RoleName.hcp) {
            return true;
          }
          return false;
        });
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

  emitCountToChild() {
    this.dropdownCount.next(this.itemsPerPage);
  }

  onClearFilter(form) {
    this.isSearched = false;
    form.resetForm();
    this.filter.tillDate = moment().toISOString();
    this.filter.fromDate = moment().subtract(1, 'days').toISOString();
    if (this.userPermissions.includes('ViewTenantReport')) {
      this.itemsPerPage = 10;
      this.emitCountToChild();
      this.getReports(1, this.itemsPerPage);
    } else {
      this.modReportList = null;
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
