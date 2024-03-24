import { Location } from '@angular/common';
import {
  Component,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouteComponentBase } from '@vmsl/core/route-component-base';
import { UserSessionStoreService } from '@vmsl/core/store/user-session-store.service';
import { IVmslGridColumn } from '@vmsl/shared/vmsl-grid/wrapper-interfaces';
import { columnDefinitions } from '../../shared/models/mod-metric-report-grid-headers';
import { RoleType, RoleName } from '@vmsl/core/enums';
import * as moment from 'moment';
import { ReportsService } from '../../shared/reports.service';
import { ModMetric } from '../../shared/models/mod-reports-model';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { NbDialogModule } from '@nebular/theme';
import { UserFacadeService } from '@vmsl/shared/facades/user-facade.service';
import { UserInfo } from '@vmsl/core/auth/models/user.model';
import { NgSelectComponent } from '@ng-select/ng-select';

const dayBefore = 1;

@Component({
  selector: 'vmsl-mod-metric-report',
  templateUrl: './mod-metric-report.component.html',
  styleUrls: ['./mod-metric-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ModMetricReportComponent extends RouteComponentBase {
  columnDefinition: IVmslGridColumn[];
  filter = {
    requestorId: [],
    fromDate: null,
    tillDate: null,
  };
  isSearched = false;
  requestors: UserInfo[];
  currentPage = 1;
  userPermissions: string[];
  modReportList: ModMetric[];
  itemsPerPage: number;
  orderFilter = [];
  totalReportsCount: number;
  currentUserId: string;
  noRowsTemplate = '<span>No Reports Found!</span>';
  dropdownCount: Subject<number> = new Subject<number>();
  loading = false;
  gridApi;
  gridColumnApi;
  @ViewChild('viewModReportDialog', { read: TemplateRef })
  viewModReportDialog: TemplateRef<NbDialogModule>;
  @ViewChild('form') form: NgForm;
  constructor(
    protected readonly location: Location,
    protected readonly route: ActivatedRoute,
    private readonly sessionStore: UserSessionStoreService,
    private readonly reportsService: ReportsService,
    private readonly userFacadeService: UserFacadeService,
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
    this.filter.fromDate = moment().subtract(dayBefore, 'days').toISOString();
    if (this.userPermissions.includes('ViewTenantAudit')) {
      this.getReports(1, this.itemsPerPage);
    }
    this.filterUsersOnPermission();
  }

  getReports(pageNo, itemsPerPage, form?, allRequestor?: NgSelectComponent) {
    const daysDiff = moment(this.filter.tillDate).diff(
      this.filter.fromDate,
      'days',
      true,
    );
    if (form) {
      if (!this.checkDateDiff(daysDiff, form)) {
        return;
      }
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
        .getModMetricReportList(
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
              this.loading = false;
            } else {
              this.reportsService
                .getModMetricReportList(
                  1,
                  itemsPerPage,
                  this.filter,
                  this.orderFilter,
                )
                .subscribe(res => {
                  this.modReportList = res;
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

  checkDateDiff(daysDiff, form) {
    const maxDaysDiff = 30;
    let invalid = true;
    if (daysDiff > maxDaysDiff) {
      form.form.controls['fromDate']?.setErrors({ maxRequired: true });
      invalid = false;
    } else if (form.form && form.form.controls['fromDate']?.invalid) {
      form.form.controls['fromDate']?.setErrors(null);
      invalid = false;
    } else {
      //empty else block
    }
    return invalid;
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
  onClearFilter(form) {
    this.isSearched = false;
    form.resetForm();
    if (this.userPermissions.includes('ViewTenantAudit')) {
      this.itemsPerPage = 10;
      this.getReports(1, this.itemsPerPage);
    } else {
      this.modReportList = null;
    }
    this.currentPage = 1;
  }
  filterUsersOnPermission() {
    if (this.userPermissions.includes('ViewTenantAudit')) {
      this._subscriptions.push(
        this.userFacadeService.getUserList().subscribe(resp => {
          const requestors = resp.filter(
            item =>
              item.roleType !== RoleType.hcp &&
              item.roleType !== RoleType.Administrator,
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
}
