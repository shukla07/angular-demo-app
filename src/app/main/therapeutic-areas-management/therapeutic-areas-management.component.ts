import {Location} from '@angular/common';
import {
  Component,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {NbDialogModule, NbDialogRef, NbDialogService} from '@nebular/theme';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {environment} from '@vmsl/env/environment';
import {TherapeuticAreasService} from '@vmsl/shared/facades/therapeutic-areas.service';
import {UserFacadeService} from '@vmsl/shared/facades/user-facade.service';
import {pageLimitMaxThousand} from '@vmsl/shared/model/items-per-page-list';
import {IVmslGridColumn} from '@vmsl/shared/vmsl-grid/wrapper-interfaces';
import {ToastrService} from 'ngx-toastr';
import {Subject} from 'rxjs';
import {TherapeuticArea} from './shared/models/therapeutic-area-info.model.ts';
import {columnDefinitions} from './shared/models/therapeutic-areas-management-grid-headers';

@Component({
  selector: 'vmsl-therapeutic-areas-management',
  templateUrl: './therapeutic-areas-management.component.html',
  styleUrls: ['./therapeutic-areas-management.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TherapeuticAreasManagementComponent extends RouteComponentBase {
  permissionKey = Permission;
  title = 'Therapeutic Areas Management';
  therapeuticAreasList: TherapeuticArea[];
  therapeuticAreas: TherapeuticArea[];
  itemsPerPage: number;
  currentPage = 1;
  totalTherapeuticAreasCount: number;
  columnDefinition: IVmslGridColumn[];
  noRowsTemplate = '<span>No Therapeutic Areas Found</span>';
  dropdownCount: Subject<number> = new Subject<number>();
  rowChecked = false;
  loading = false;
  gridApi;
  gridColumnApi;
  itemsPerPageList = pageLimitMaxThousand;
  therapeuticAreaId: string;
  statusTemplateSwitch = false;
  deleteTemplateSwitch = false;
  selectedRows: TherapeuticArea[];
  filter = {
    therapeuticAreaId: null,
    status: null,
  };
  isSearched = false;
  orderFilter = [];
  @ViewChild('therapeuticAreaStatusDialog', {read: TemplateRef})
  therapeuticAreaStatusDialog: TemplateRef<NbDialogModule>;
  @ViewChild('deleteTherapeuticAreaDialog', {read: TemplateRef})
  deleteTherapeuticAreaDialog: TemplateRef<NbDialogModule>;
  @ViewChild('form') form: NgForm;
  deleteDialogRef: NbDialogRef<NbDialogModule>;
  statusDialogRef: NbDialogRef<NbDialogModule>;

  constructor(
    private readonly router: Router,
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly therapeuticAreasService: TherapeuticAreasService,
    private readonly dialogService: NbDialogService,
    private readonly toastr: ToastrService,
    private readonly store: UserSessionStoreService,
    private readonly userFacadeService: UserFacadeService,
  ) {
    super(route, location);
  }

  ngOnInit() {
    this._subscriptions.push(
      this.therapeuticAreasService.therapeuticAreaStatusObv.subscribe(resp => {
        if (resp) {
          this.open(this.therapeuticAreaStatusDialog, resp, 'single');
          this.therapeuticAreasService.setTherapeuticAreaStatus(null);
        }
      }),
    );

    this._subscriptions.push(
      this.therapeuticAreasService.therapeuticAreaDeleteObv.subscribe(resp => {
        if (resp) {
          this.open(this.deleteTherapeuticAreaDialog, resp, 'single');
          this.therapeuticAreasService.setTherapeuticAreaToBeDeleted(null);
        }
      }),
    );

    this._subscriptions.push(
      this.userFacadeService.nameColumnSortSortObv.subscribe(resp => {
        if (resp) {
          this.sortTherapeuticAreasList(resp);
          this.userFacadeService.setNameColumnSort(null);
        }
      }),
    );

    super.ngOnInit();
    this.getFilteredTherapeuticAreas();
    if (
      this.store.getUser().permissions.includes('UpdateTenanttherapeuticArea')
    ) {
      this.columnDefinition = columnDefinitions();
    } else {
      this.title = 'Therapeutic Areas';
      const arrLastEle = -1;
      this.columnDefinition = columnDefinitions().slice(1, arrLastEle);
    }
    this.itemsPerPage = 10;
    this.getTherapeuticAreasList(this.currentPage, this.itemsPerPage);
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

  getTherapeuticAreasList(pageNo, itemsPerPage, form?) {
    if (form) {
      this.loading = true;
    }
    this._subscriptions.push(
      this.therapeuticAreasService
        .getFilteredTherapeuticAreasList(
          pageNo,
          itemsPerPage,
          this.filter,
          this.orderFilter,
        )
        .subscribe(resp => {
          if (resp.length > 0) {
            this.therapeuticAreasList = resp;
            this.getTherapeuticAreasCount();
            this.loading = false;
          } else {
            this.therapeuticAreasService
              .getFilteredTherapeuticAreasList(
                1,
                itemsPerPage,
                this.filter,
                this.orderFilter,
              )
              .subscribe(
                res => {
                  this.therapeuticAreasList = res;
                  this.getTherapeuticAreasCount();
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

  getTherapeuticAreasCount() {
    this._subscriptions.push(
      this.therapeuticAreasService
        .getTherapeuticAreasCount(this.filter)
        .subscribe(resp => {
          this.totalTherapeuticAreasCount = resp['count'];
        }),
    );
  }

  getFilteredTherapeuticAreas() {
    this._subscriptions.push(
      this.therapeuticAreasService
        .getTherapeuticAreasFiltered()
        .subscribe(resp => {
          this.therapeuticAreas = resp;
        }),
    );
  }

  sortTherapeuticAreasList(resp) {
    this.orderFilter = this.orderFilter.filter(
      item => !item.includes(resp.columnName),
    );
    if (resp.sort !== 'none') {
      this.orderFilter.unshift(`${resp.columnName} ${resp.sort}`);
    }
    this.getTherapeuticAreasList(
      this.currentPage,
      this.itemsPerPage,
      this.filter,
    );
  }

  open(dialog: TemplateRef<NbDialogModule>, data: Object, type: string) {
    this.therapeuticAreaId = data['therapeuticAreaId'];
    if (data['therapeuticAreaName']) {
      this.deleteDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: {
          message: `Do you really want to delete ${data['therapeuticAreaName']}?`,
          status: 'delete',
          confirmMessage: `${data['therapeuticAreaName']} has been deleted`,
        },
      });
    } else if (data['status'] === 0 || data === 'success') {
      this.statusDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: {
          message:
            'Do you really want to activate selected therapeutic area(s)?',
          status: 'activate',
          confirmMessage: 'Therapeutic Area(s) has been activated',
          type: type,
        },
      });
    } else if (data['status'] === 1 || data === 'danger') {
      this.statusDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: {
          message:
            'Do you really want to deactivate selected therapeutic area(s)?',
          status: 'deactivate',
          confirmMessage: 'Therapeutic Area(s) has been deactivated',
          type: type,
        },
      });
    } else {
      // empty else block
    }
  }

  activOrDeactivTherapeuticArea() {
    let therapeuticArea = new TherapeuticArea();
    this._subscriptions.push(
      this.therapeuticAreasService
        .getTherapeuticAreaById(this.therapeuticAreaId)
        .subscribe(res => {
          therapeuticArea = res;
          if (therapeuticArea.status === 0) {
            therapeuticArea.status = 1;
          } else {
            therapeuticArea.status = 0;
          }
          this.therapeuticAreasService
            .editTherapeuticArea(therapeuticArea, this.therapeuticAreaId)
            .subscribe(() => {
              this.getTherapeuticAreasList(this.currentPage, this.itemsPerPage);
              this.statusTemplateSwitch = true;
            });
        }),
    );
  }

  bulkTherapeuticAreasStatusChange(status) {
    this.selectedRows = this.gridApi.getSelectedRows();
    if (this.selectedRows.length > 0) {
      const selectedtherapeuticAreaId = [];
      this.selectedRows.forEach(therapeuticArea => {
        selectedtherapeuticAreaId.push(therapeuticArea.id);
      });
      const updatedStatus = status === 'deactivate' ? 0 : 1;
      const therapeuticAreaData = {
        id: selectedtherapeuticAreaId,
        status: updatedStatus,
      };
      this.therapeuticAreasService
        .updateBulkTherapeuticAreaStatus(therapeuticAreaData)
        .subscribe(resp => {
          if (resp['success']) {
            this.getTherapeuticAreasList(this.currentPage, this.itemsPerPage);
            this.statusTemplateSwitch = true;
            this.rowChecked = false;
          }
        });
    }
  }

  deleteTherapeuticArea() {
    this._subscriptions.push(
      this.therapeuticAreasService
        .deleteTherapeuticArea(this.therapeuticAreaId)
        .subscribe(resp => {
          if (resp['success']) {
            this.getTherapeuticAreasList(this.currentPage, this.itemsPerPage);
            this.deleteTemplateSwitch = true;
            this.rowChecked = false;
            this.getFilteredTherapeuticAreas();
          }
        }),
    );
  }

  checkColumnSelection(exportType: string) {
    this.selectedRows = this.gridApi.getSelectedRows();
    const maxExportRowsLimit = 5;
    if (this.selectedRows.length) {
      if (this.selectedRows.length <= maxExportRowsLimit) {
        this.filter.therapeuticAreaId = [];
        this.selectedRows.forEach(therapeuticArea => {
          this.filter.therapeuticAreaId.push(therapeuticArea.id);
        });
        this.exportTherapeuticAreas(exportType);
      } else {
        this.toastr.warning(
          'Please select 5 or less therapeutic areas.',
          'Attention',
          {
            timeOut: environment.messageTimeout,
          },
        );
      }
    } else {
      this.exportTherapeuticAreas(exportType);
    }
  }

  exportTherapeuticAreas(exportType: string) {
    this._subscriptions.push(
      this.therapeuticAreasService
        .exportTherapeuticAreaList(this.filter, exportType, this.orderFilter)
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

  onClickAddTherapeuticArea() {
    this.router.navigate(['/main/therapeutic-areas-management/add']);
  }

  onClearFilter(form) {
    form.resetForm();
    this.isSearched = false;
    this.itemsPerPage = 10;
    this.currentPage = 1;
    this.gridApi.deselectAll();
    this.emitCountToChild();
  }

  emitCountToChild() {
    this.dropdownCount.next(this.itemsPerPage);
  }

  getPaginationValue(data) {
    this.itemsPerPage = data;
    this.getTherapeuticAreasList(this.currentPage, data);
  }

  paginationEvent(pageNo) {
    this.currentPage = pageNo;
    if (!this.isSearched) {
      this.form.reset();
    }
    this.getTherapeuticAreasList(pageNo, this.itemsPerPage);
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
