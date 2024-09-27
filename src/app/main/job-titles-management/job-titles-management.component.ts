import {Location} from '@angular/common';
import {
  Component,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NbDialogModule, NbDialogRef, NbDialogService} from '@nebular/theme';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {environment} from '@vmsl/env/environment';
import {
  pageLimitMaxThousand,
  limitTen,
} from '@vmsl/shared/model/items-per-page-list';
import {IVmslGridColumn} from '@vmsl/shared/vmsl-grid/wrapper-interfaces';
import {ToastrService} from 'ngx-toastr';
import {Subject} from 'rxjs';
import {columnDefinitions} from './shared/models/job-titles-management-grid-header';
import {JobTitle} from './shared/models/job-titles-info.model';
import {JobTitlesManagementService} from '@vmsl/shared/facades/job-titles-management.service';
import {Status} from '@vmsl/core/enums/status.enum';

@Component({
  selector: 'vmsl-job-titles-management',
  templateUrl: './job-titles-management.component.html',
  styleUrls: ['./job-titles-management.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class JobTitlesManagementComponent extends RouteComponentBase {
  permissionKey = Permission;
  title = 'Role Management';
  titleList: JobTitle[];
  jobTitles: JobTitle[];
  itemsPerPage: number;
  currentPage = 1;
  totalTitlesCount: number;
  columnDefinition: IVmslGridColumn[];
  noRowsTemplate = '<span>No Roles Found</span>';
  dropdownCount: Subject<number> = new Subject<number>();
  rowChecked = false;
  loading = false;
  gridApi;
  gridColumnApi;
  itemsPerPageList = pageLimitMaxThousand;
  jobTitleId: string;
  statusTemplateSwitch = false;
  deleteTemplateSwitch = false;
  selectedRows: JobTitle[];
  filter = {
    jobTitleId: null,
    status: null,
  };
  orderFilter = [];
  jobTitleEnum = Status;
  @ViewChild('jobTitleStatusDialog', {read: TemplateRef})
  jobTitleStatusDialog: TemplateRef<NbDialogModule>;
  @ViewChild('deleteJobDeleteDialog', {read: TemplateRef})
  deleteJobDeleteDialog: TemplateRef<NbDialogModule>;
  deleteDialogRef: NbDialogRef<NbDialogModule>;
  statusDialogRef: NbDialogRef<NbDialogModule>;

  constructor(
    private readonly router: Router,
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly jobTitleService: JobTitlesManagementService,
    private readonly dialogService: NbDialogService,
    private readonly toastr: ToastrService,
  ) {
    super(route, location);
  }

  ngOnInit() {
    this._subscriptions.push(
      this.jobTitleService.jobTitleStatusObv.subscribe(resp => {
        if (resp) {
          this.open(this.jobTitleStatusDialog, resp, 'single');
          this.jobTitleService.setJobTitleStatus(null);
        }
      }),
    );

    this._subscriptions.push(
      this.jobTitleService.jobTitleDeleteObv.subscribe(resp => {
        if (resp) {
          this.open(this.deleteJobDeleteDialog, resp, 'single');
          this.jobTitleService.setJobTitleToBeDeleted(null);
        }
      }),
    );

    this._subscriptions.push(
      this.jobTitleService.titleSortObv.subscribe(resp => {
        if (resp) {
          this.sortJobTitlesList(resp);
          this.jobTitleService.setJobTitleSort(null);
        }
      }),
    );
    super.ngOnInit();
    this.getFilteredJobTitles();
    this.columnDefinition = columnDefinitions();
    this.itemsPerPage = limitTen;
    this.getJobTitlesList(this.currentPage, this.itemsPerPage);
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
      this.gridColumnApi.autoSizeColumns();
    } else {
      this.gridApi.sizeColumnsToFit();
    }
  }

  getJobTitlesList(pageNo, itemsPerPage, form?) {
    if (form) {
      this.loading = true;
    }
    this._subscriptions.push(
      this.jobTitleService
        .getFilteredJobTitlesList(
          pageNo,
          itemsPerPage,
          this.filter,
          this.orderFilter,
        )
        .subscribe(resp => {
          if (resp.length > 0) {
            this.titleList = resp;
            this.getTitlesCount();
            this.loading = false;
          } else {
            this.jobTitleService
              .getFilteredJobTitlesList(
                1,
                itemsPerPage,
                this.filter,
                this.orderFilter,
              )
              .subscribe(
                res => {
                  this.titleList = res;
                  this.getTitlesCount();
                  this.loading = false;
                },
                err => {
                  this.loading = false;
                  form.reset();
                },
              );
            this.currentPage = 1;
          }
        }),
    );
  }

  getTitlesCount() {
    this._subscriptions.push(
      this.jobTitleService.getTitlesCount(this.filter).subscribe(resp => {
        this.totalTitlesCount = resp['count'];
      }),
    );
  }

  getFilteredJobTitles() {
    this._subscriptions.push(
      this.jobTitleService.getJobFiltersFiltered().subscribe(resp => {
        this.jobTitles = resp;
      }),
    );
  }

  sortJobTitlesList(resp) {
    this.orderFilter = this.orderFilter.filter(
      item => !item.includes(resp.columnName),
    );
    if (resp.sort !== 'none') {
      this.orderFilter.unshift(`${resp.columnName} ${resp.sort}`);
    }
    this.getJobTitlesList(this.currentPage, this.itemsPerPage, this.filter);
  }

  open(dialog: TemplateRef<NbDialogModule>, data: Object, type: string) {
    this.jobTitleId = data['jobTitleId'];
    if (data['jobTitleName']) {
      this.deleteDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: {
          message: `Do you really want to delete ${data['jobTitleName']}?`,
          status: 'delete',
          confirmMessage: `${data['jobTitleName']} has been deleted`,
        },
      });
    } else if (
      data['status'] === this.jobTitleEnum.inactive ||
      data === 'success'
    ) {
      this.statusDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: {
          message:
            'Do you really want to activate selected role/roles?',
          status: 'activate',
          confirmMessage: 'Role/Roles has been activated',
          type: type,
        },
      });
    } else if (
      data['status'] === this.jobTitleEnum.active ||
      data === 'danger'
    ) {
      this.statusDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: {
          message:
            'Do you really want to deactivate selected role/roles?',
          status: 'deactivate',
          confirmMessage: 'Role/Roles has been deactivated',
          type: type,
        },
      });
    } else {
      // empty else block
    }
  }

  activOrDeactivJobTitle() {
    let jobTitle = new JobTitle();
    this._subscriptions.push(
      this.jobTitleService.getJobTitleById(this.jobTitleId).subscribe(res => {
        jobTitle = res;
        if (jobTitle.status === 0) {
          jobTitle.status = this.jobTitleEnum.active;
        } else {
          jobTitle.status = this.jobTitleEnum.inactive;
        }
        this.jobTitleService
          .editJobTitle(jobTitle, this.jobTitleId)
          .subscribe(() => {
            this.getJobTitlesList(this.currentPage, this.itemsPerPage);
            this.statusTemplateSwitch = true;
          });
      }),
    );
  }

  bulkJobTitleStatusChange(status) {
    this.selectedRows = this.gridApi.getSelectedRows();
    if (this.selectedRows.length > 0) {
      const selectedJobTitleId = [];
      this.selectedRows.forEach(jobTitle => {
        selectedJobTitleId.push(jobTitle.id);
      });
      const updatedStatus = status === 'deactivate' ? 0 : 1;
      const jobTitleData = {id: selectedJobTitleId, status: updatedStatus};
      this.jobTitleService
        .updateBulkJobTitleStatus(jobTitleData)
        .subscribe(resp => {
          if (resp['success']) {
            this.getJobTitlesList(this.currentPage, this.itemsPerPage);
            this.statusTemplateSwitch = true;
            this.rowChecked = false;
          }
        });
    }
  }

  deleteJobTitle() {
    this._subscriptions.push(
      this.jobTitleService.deleteJobTitle(this.jobTitleId).subscribe(resp => {
        if (resp['success']) {
          this.getJobTitlesList(this.currentPage, this.itemsPerPage);
          this.deleteTemplateSwitch = true;
          this.rowChecked = false;
          this.getFilteredJobTitles();
        }
      }),
    );
  }

  checkColumnSelection(exportType: string) {
    this.selectedRows = this.gridApi.getSelectedRows();
    const maxExportRowsLimit = 5;
    if (this.selectedRows.length) {
      if (this.selectedRows.length <= maxExportRowsLimit) {
        this.filter.jobTitleId = [];
        this.selectedRows.forEach(jobTitle => {
          this.filter.jobTitleId.push(jobTitle.id);
        });
        this.exportJobTitles(exportType);
      } else {
        this.toastr.warning(
          'Please select 5 or less roles areas.',
          'Attention',
          {
            timeOut: environment.messageTimeout,
          },
        );
      }
    } else {
      this.exportJobTitles(exportType);
    }
  }

  exportJobTitles(exportType: string) {
    this._subscriptions.push(
      this.jobTitleService
        .exportJobTitleList(this.filter, exportType, this.orderFilter)
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

  onClickAddJobTitle() {
    this.router.navigate(['/main/job-titles-management/add']);
  }

  onClearFilter(form) {
    form.resetForm();
    this.itemsPerPage = limitTen;
    this.currentPage = 1;
    this.gridApi.deselectAll();
    this.emitCountToChild();
  }

  emitCountToChild() {
    this.dropdownCount.next(this.itemsPerPage);
  }

  getPaginationValue(data) {
    this.itemsPerPage = data;
    this.getJobTitlesList(this.currentPage, data);
  }

  paginationEvent(pageNo) {
    this.currentPage = pageNo;
    this.getJobTitlesList(pageNo, this.itemsPerPage);
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  onRowChecked(param) {
    if (param.api.getSelectedRows().length > 0) {
      this.rowChecked = true;
    } else {
      this.rowChecked = false;
    }
  }
}
