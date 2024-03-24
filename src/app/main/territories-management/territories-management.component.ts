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
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {environment} from '@vmsl/env/environment';
import {pageLimitMaxThousand} from '@vmsl/shared/model/items-per-page-list';
import {IVmslGridColumn} from '@vmsl/shared/vmsl-grid/wrapper-interfaces';
import {ToastrService} from 'ngx-toastr';
import {Subject} from 'rxjs';
import {columnDefinitions} from './shared/models/territories-management-grid-header';
import {Territory} from './shared/models/territory-info.model';
import {UserFacadeService} from '@vmsl/shared/facades/user-facade.service';
import {TerritoryManagementService} from '@vmsl/shared/facades/territory-management.service';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'vmsl-territories-management',
  templateUrl: './territories-management.component.html',
  styleUrls: ['./territories-management.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TerritoriesManagementComponent extends RouteComponentBase {
  permissionKey = Permission;
  title = 'Territory Management';
  territoryList: Territory[];
  territories: Territory[];
  itemsPerPage: number;
  currentPage = 1;
  totalTerritoriesCount: number;
  columnDefinition: IVmslGridColumn[];
  noRowsTemplate = '<span>No Territories Found</span>';
  dropdownCount: Subject<number> = new Subject<number>();
  rowChecked = false;
  loading = false;
  gridApi;
  gridColumnApi;
  itemsPerPageList = pageLimitMaxThousand;
  territoryId: string;
  statusTemplateSwitch = false;
  deleteTemplateSwitch = false;
  selectedRows: Territory[];
  filter = {
    territoryId: null,
    status: null,
  };
  isSearched = false;
  orderFilter = [];
  @ViewChild('territoryStatusDialog', {read: TemplateRef})
  territoryStatusDialog: TemplateRef<NbDialogModule>;
  @ViewChild('deleteTerritoryDialog', {read: TemplateRef})
  deleteTerritoryDialog: TemplateRef<NbDialogModule>;
  @ViewChild('form') form: NgForm;
  deleteDialogRef: NbDialogRef<NbDialogModule>;
  statusDialogRef: NbDialogRef<NbDialogModule>;

  constructor(
    private readonly router: Router,
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly territoryService: TerritoryManagementService,
    private readonly dialogService: NbDialogService,
    private readonly toastr: ToastrService,
    private readonly store: UserSessionStoreService,
    private readonly userFacadeService: UserFacadeService,
  ) {
    super(route, location);
  }

  ngOnInit() {
    this._subscriptions.push(
      this.territoryService.territoryStatusObv.subscribe(resp => {
        if (resp) {
          this.open(this.territoryStatusDialog, resp, 'single');
          this.territoryService.setTerritoryStatus(null);
        }
      }),
    );

    this._subscriptions.push(
      this.territoryService.territoryDeleteObv.subscribe(resp => {
        if (resp) {
          this.open(this.deleteTerritoryDialog, resp, 'single');
          this.territoryService.setTerritoryToBeDeleted(null);
        }
      }),
    );

    this._subscriptions.push(
      this.userFacadeService.nameColumnSortSortObv.subscribe(resp => {
        if (resp) {
          this.sortTerritoriesList(resp);
          this.userFacadeService.setNameColumnSort(null);
        }
      }),
    );
    super.ngOnInit();
    this.getFilteredTerritories();
    if (this.store.getUser().permissions.includes('UpdateTenantTerritory')) {
      this.columnDefinition = columnDefinitions();
    } else {
      this.title = 'Territories';
      const arrayLastEle = -1;
      this.columnDefinition = columnDefinitions().slice(1, arrayLastEle);
    }
    this.itemsPerPage = 10;
    this.getTerritoriesList(this.currentPage, this.itemsPerPage);
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

  getTerritoriesList(pageNo, itemsPerPage, form?) {
    if (form) {
      this.loading = true;
    }
    this._subscriptions.push(
      this.territoryService
        .getFilteredTerritoriesList(
          pageNo,
          itemsPerPage,
          this.filter,
          this.orderFilter,
        )
        .subscribe(resp => {
          if (resp.length > 0) {
            this.territoryList = resp;
            this.getTerritoriesCount();
            this.loading = false;
          } else {
            this.territoryService
              .getFilteredTerritoriesList(
                1,
                itemsPerPage,
                this.filter,
                this.orderFilter,
              )
              .subscribe(
                res => {
                  this.territoryList = res;
                  this.getTerritoriesCount();
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

  getTerritoriesCount() {
    this._subscriptions.push(
      this.territoryService.getTerritoriesCount(this.filter).subscribe(resp => {
        this.totalTerritoriesCount = resp['count'];
      }),
    );
  }

  getFilteredTerritories() {
    this._subscriptions.push(
      this.territoryService.getTerritoriesFiltered().subscribe(resp => {
        this.territories = resp;
      }),
    );
  }

  sortTerritoriesList(resp) {
    this.orderFilter = this.orderFilter.filter(
      item => !item.includes(resp.columnName),
    );
    if (resp.sort !== 'none') {
      this.orderFilter.unshift(`${resp.columnName} ${resp.sort}`);
    }
    this.getTerritoriesList(this.currentPage, this.itemsPerPage, this.filter);
  }

  open(dialog: TemplateRef<NbDialogModule>, data: Object, type: string) {
    this.territoryId = data['territoryId'];
    if (data['territoryName']) {
      this.deleteDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: {
          message: `Do you really want to delete ${data['territoryName']}?`,
          status: 'delete',
          confirmMessage: `${data['territoryName']} has been deleted`,
        },
      });
    } else if (data['status'] === 0 || data === 'success') {
      this.statusDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: {
          message:
            'Do you really want to activate selected territory/territories?',
          status: 'activate',
          confirmMessage: 'Territory/Territories has been activated',
          type: type,
        },
      });
    } else if (data['status'] === 1 || data === 'danger') {
      this.statusDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: {
          message:
            'Do you really want to deactivate selected territory/territories?',
          status: 'deactivate',
          confirmMessage: 'Territory/Territories has been deactivated',
          type: type,
        },
      });
    } else {
      // empty else block
    }
  }

  activOrDeactivTerritory() {
    let territory = new Territory();
    this._subscriptions.push(
      this.territoryService
        .getTerritoryById(this.territoryId)
        .subscribe(res => {
          territory = res;
          if (territory.status === 0) {
            territory.status = 1;
          } else {
            territory.status = 0;
          }
          this.territoryService
            .editTerritory(territory, this.territoryId)
            .subscribe(() => {
              this.getTerritoriesList(this.currentPage, this.itemsPerPage);
              this.statusTemplateSwitch = true;
            });
        }),
    );
  }

  bulkTerritoryStatusChange(status) {
    this.selectedRows = this.gridApi.getSelectedRows();
    if (this.selectedRows.length > 0) {
      const selectedTerritoryId = [];
      this.selectedRows.forEach(territory => {
        selectedTerritoryId.push(territory.id);
      });
      const updatedStatus = status === 'deactivate' ? 0 : 1;
      const territoryData = {id: selectedTerritoryId, status: updatedStatus};
      this.territoryService
        .updateBulkTerritoryStatus(territoryData)
        .subscribe(resp => {
          if (resp['success']) {
            this.getTerritoriesList(this.currentPage, this.itemsPerPage);
            this.statusTemplateSwitch = true;
            this.rowChecked = false;
          }
        });
    }
  }

  deleteTerritory() {
    this._subscriptions.push(
      this.territoryService
        .deleteTerritory(this.territoryId)
        .subscribe(resp => {
          if (resp['success']) {
            this.getTerritoriesList(this.currentPage, this.itemsPerPage);
            this.deleteTemplateSwitch = true;
            this.rowChecked = false;
            this.getFilteredTerritories();
          }
        }),
    );
  }

  checkColumnSelection(exportType: string) {
    this.selectedRows = this.gridApi.getSelectedRows();
    const maxExportRowsLimit = 5;
    if (this.selectedRows.length) {
      if (this.selectedRows.length <= maxExportRowsLimit) {
        this.filter.territoryId = [];
        this.selectedRows.forEach(territory => {
          this.filter.territoryId.push(territory.id);
        });
        this.exportTerritories(exportType);
      } else {
        this.toastr.warning(
          'Please select 5 or less territories areas.',
          'Attention',
          {
            timeOut: environment.messageTimeout,
          },
        );
      }
    } else {
      this.exportTerritories(exportType);
    }
  }

  exportTerritories(exportType: string) {
    this._subscriptions.push(
      this.territoryService
        .exportTerritoryList(this.filter, exportType, this.orderFilter)
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

  onClickAddTerritory() {
    this.router.navigate(['/main/territories-management/add']);
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
    this.getTerritoriesList(this.currentPage, data);
  }

  paginationEvent(pageNo) {
    this.currentPage = pageNo;
    if (!this.isSearched) {
      this.form.reset();
    }
    this.getTerritoriesList(pageNo, this.itemsPerPage);
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
