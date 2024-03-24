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
import {DiseaseAreasService} from '@vmsl/shared/facades/disease-areas.service';
import {UserFacadeService} from '@vmsl/shared/facades/user-facade.service';
import {pageLimitMaxThousand} from '@vmsl/shared/model/items-per-page-list';
import {IVmslGridColumn} from '@vmsl/shared/vmsl-grid/wrapper-interfaces';
import {ToastrService} from 'ngx-toastr';
import {Subject} from 'rxjs';
import {DiseaseArea} from './shared/models/disease-area-info.model';
import {columnDefinitions} from './shared/models/disease-areas-grid-headers';

@Component({
  selector: 'vmsl-disease-areas',
  templateUrl: './disease-areas.component.html',
  styleUrls: ['./disease-areas.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DiseaseAreasComponent extends RouteComponentBase {
  permissionKey = Permission;
  title = 'Product/Disease Area Management';
  diseaseAreasList: DiseaseArea[];
  diseaseAreas: DiseaseArea[];
  itemsPerPage: number;
  currentPage = 1;
  totalDiseaseAreasCount: number;
  columnDefinition: IVmslGridColumn[];
  noRowsTemplate = '<span>No Product/Disease Area Found</span>';
  dropdownCount: Subject<number> = new Subject<number>();
  rowChecked = false;
  loading = false;
  gridApi;
  gridColumnApi;
  itemsPerPageList = pageLimitMaxThousand;
  diseaseAreaId: string;
  statusTemplateSwitch = false;
  deleteTemplateSwitch = false;
  selectedRows: DiseaseArea[];
  filter = {
    diseaseAreaId: null,
    status: null,
  };
  isSearched = false;
  orderFilter = [];
  @ViewChild('diseaseAreaStatusDialog', {read: TemplateRef})
  diseaseAreaStatusDialog: TemplateRef<NbDialogModule>;
  @ViewChild('deleteDiseaseAreaDialog', {read: TemplateRef})
  deleteDiseaseAreaDialog: TemplateRef<NbDialogModule>;
  @ViewChild('form') form: NgForm;
  deleteDialogRef: NbDialogRef<NbDialogModule>;
  statusDialogRef: NbDialogRef<NbDialogModule>;

  constructor(
    private readonly router: Router,
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly diseaseAreasService: DiseaseAreasService,
    private readonly dialogService: NbDialogService,
    private readonly toastr: ToastrService,
    private readonly store: UserSessionStoreService,
    private readonly userFacadeService: UserFacadeService,
  ) {
    super(route, location);
  }

  ngOnInit() {
    this._subscriptions.push(
      this.diseaseAreasService.diseaseAreaStatusObv.subscribe(resp => {
        if (resp) {
          this.open(this.diseaseAreaStatusDialog, resp, 'single');
          this.diseaseAreasService.setDiseaseAreaStatus(null);
        }
      }),
    );

    this._subscriptions.push(
      this.diseaseAreasService.diseaseAreaDeleteObv.subscribe(resp => {
        if (resp) {
          this.open(this.deleteDiseaseAreaDialog, resp, 'single');
          this.diseaseAreasService.setDiseaseAreaToBeDeleted(null);
        }
      }),
    );

    this._subscriptions.push(
      this.userFacadeService.nameColumnSortSortObv.subscribe(resp => {
        if (resp) {
          this.sortDiseaseAreasList(resp);
          this.userFacadeService.setNameColumnSort(null);
        }
      }),
    );
    super.ngOnInit();
    this.getFiltereddiseaseAreas();
    if (this.store.getUser().permissions.includes('UpdateTenantDiseaseArea')) {
      this.columnDefinition = columnDefinitions();
    } else {
      this.title = 'Product/Disease Area';
      const arrLastEle = -1;
      this.columnDefinition = columnDefinitions().slice(1, arrLastEle);
    }
    this.itemsPerPage = 10;
    this.getDiseaseAreasList(this.currentPage, this.itemsPerPage);
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

  getDiseaseAreasList(pageNo, itemsPerPage, form?) {
    if (form) {
      this.loading = true;
    }
    this._subscriptions.push(
      this.diseaseAreasService
        .getFilteredDiseaseAreasList(
          pageNo,
          itemsPerPage,
          this.filter,
          this.orderFilter,
        )
        .subscribe(resp => {
          if (resp.length > 0) {
            this.diseaseAreasList = resp;
            this.getDiseaseAreasCount();
            this.loading = false;
          } else {
            this.diseaseAreasService
              .getFilteredDiseaseAreasList(
                1,
                itemsPerPage,
                this.filter,
                this.orderFilter,
              )
              .subscribe(
                res => {
                  this.diseaseAreasList = res;
                  this.getDiseaseAreasCount();
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

  getDiseaseAreasCount() {
    this._subscriptions.push(
      this.diseaseAreasService
        .getDiseaseAreasCount(this.filter)
        .subscribe(resp => {
          this.totalDiseaseAreasCount = resp['count'];
        }),
    );
  }

  getFiltereddiseaseAreas() {
    this._subscriptions.push(
      this.diseaseAreasService.getDiseaseAreasFiltered().subscribe(resp => {
        this.diseaseAreas = resp;
      }),
    );
  }

  sortDiseaseAreasList(resp) {
    this.orderFilter = this.orderFilter.filter(
      item => !item.includes(resp.columnName),
    );
    if (resp.sort !== 'none') {
      this.orderFilter.unshift(`${resp.columnName} ${resp.sort}`);
    }
    this.getDiseaseAreasList(this.currentPage, this.itemsPerPage, this.filter);
  }

  open(dialog: TemplateRef<NbDialogModule>, data: Object, type: string) {
    this.diseaseAreaId = data['diseaseAreaId'];
    if (data['diseaseAreaName']) {
      this.deleteDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: {
          message: `Do you really want to delete ${data['diseaseAreaName']}?`,
          status: 'delete',
          confirmMessage: `${data['diseaseAreaName']} has been deleted`,
        },
      });
    } else if (data['status'] === 0 || data === 'success') {
      this.statusDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: {
          message:
            'Do you really want to activate selected product/disease area(s)?',
          status: 'activate',
          confirmMessage: 'Product/Disease Area(s) has been activated',
          type: type,
        },
      });
    } else if (data['status'] === 1 || data === 'danger') {
      this.statusDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: {
          message:
            'Do you really want to deactivate selected product/disease area(s)?',
          status: 'deactivate',
          confirmMessage: 'Product/Disease Area(s) has been deactivated',
          type: type,
        },
      });
    } else {
      // empty else block
    }
  }

  activeOrDeactiveDiseaseArea() {
    let territory = new DiseaseArea();
    this._subscriptions.push(
      this.diseaseAreasService
        .getDiseaseAreaById(this.diseaseAreaId)
        .subscribe(res => {
          territory = res;
          if (territory.status === 0) {
            territory.status = 1;
          } else {
            territory.status = 0;
          }
          this.diseaseAreasService
            .editDiseaseArea(territory, this.diseaseAreaId)
            .subscribe(() => {
              this.getDiseaseAreasList(this.currentPage, this.itemsPerPage);
              this.statusTemplateSwitch = true;
            });
        }),
    );
  }

  bulkDiseaseAreasStatusChange(status) {
    this.selectedRows = this.gridApi.getSelectedRows();
    if (this.selectedRows.length > 0) {
      const selecteddiseaseAreaId = [];
      this.selectedRows.forEach(territory => {
        selecteddiseaseAreaId.push(territory.id);
      });
      const updatedStatus = status === 'deactivate' ? 0 : 1;
      const territoryData = {
        id: selecteddiseaseAreaId,
        status: updatedStatus,
      };
      this.diseaseAreasService
        .updateBulkDiseaseAreaStatus(territoryData)
        .subscribe(resp => {
          if (resp['success']) {
            this.getDiseaseAreasList(this.currentPage, this.itemsPerPage);
            this.statusTemplateSwitch = true;
            this.rowChecked = false;
          }
        });
    }
  }

  deleteDiseaseArea() {
    this._subscriptions.push(
      this.diseaseAreasService
        .deleteDiseaseArea(this.diseaseAreaId)
        .subscribe(resp => {
          if (resp['success']) {
            this.getDiseaseAreasList(this.currentPage, this.itemsPerPage);
            this.deleteTemplateSwitch = true;
            this.rowChecked = false;
            this.getFiltereddiseaseAreas();
          }
        }),
    );
  }

  checkColumnSelection(exportType: string) {
    this.selectedRows = this.gridApi.getSelectedRows();
    const maxExportRowsLimit = 5;
    if (this.selectedRows.length) {
      if (this.selectedRows.length <= maxExportRowsLimit) {
        this.filter.diseaseAreaId = [];
        this.selectedRows.forEach(territory => {
          this.filter.diseaseAreaId.push(territory.id);
        });
        this.exportDiseaseAreas(exportType);
      } else {
        this.toastr.warning(
          'Please select 5 or less product/disease area.',
          'Attention',
          {
            timeOut: environment.messageTimeout,
          },
        );
      }
    } else {
      this.exportDiseaseAreas(exportType);
    }
  }

  exportDiseaseAreas(exportType: string) {
    this._subscriptions.push(
      this.diseaseAreasService
        .exportdiseaseAreaList(this.filter, exportType, this.orderFilter)
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

  onClickAddDiseaseArea() {
    this.router.navigate(['/main/disease-areas-management/add']);
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
    this.getDiseaseAreasList(this.currentPage, data);
  }

  paginationEvent(pageNo) {
    this.currentPage = pageNo;
    if (!this.isSearched) {
      this.form.reset();
    }
    this.getDiseaseAreasList(pageNo, this.itemsPerPage);
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
