import {
  Component,
  ViewChild,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {Location} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {HcpManagementService} from './shared/facades/hcp-management.service';
import {UserInfo} from '@vmsl/core/auth/models/user.model';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {IVmslGridColumn} from '@vmsl/shared/vmsl-grid/wrapper-interfaces';
import {hcpColumnDefinitions} from './shared/models/hcprequest-grid-headers';
import {NbDialogModule, NbDialogService, NbDialogRef} from '@nebular/theme';
import {Subject} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {environment} from '@vmsl/env/environment';
import {pageLimitMaxThousand} from '@vmsl/shared/model/items-per-page-list';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'vmsl-hcp-management',
  templateUrl: './hcp-management.component.html',
  styleUrls: ['./hcp-management.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HcpManagementComponent extends RouteComponentBase {
  hcpRequests: UserInfo[];
  noRowsTemplate = '<span>No Requests Found</span>';
  itemsPerPage: number;
  permissionKey = Permission;
  currentPage = 1;
  gridApi;
  gridColumnApi;
  loading = false;
  responseDialogLoding = false;
  totalHcpsCount: number;
  columnDefinition: IVmslGridColumn[];
  hcpId: string[];
  hcpReqDialogRef: NbDialogRef<NbDialogModule>;
  hcpProfileDialogRef: NbDialogRef<NbDialogModule>;
  requestTemplateSwitch = false;
  selectedRows: UserInfo[];
  rowChecked = false;
  hcpNameList: UserInfo[];
  itemsPerPageList = pageLimitMaxThousand;
  filter = {
    hcpId: null,
  };
  isSearched = false;
  dropdownCount: Subject<number> = new Subject<number>();
  @ViewChild('form') form: NgForm;

  @ViewChild('hcpResToReqDialog', {read: TemplateRef})
  hcpResToReqDialog: TemplateRef<NbDialogModule>;

  @ViewChild('hcpProfileDialog', {read: TemplateRef})
  hcpProfileDialog: TemplateRef<NbDialogModule>;

  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly dialogService: NbDialogService,
    private readonly hcpManagementService: HcpManagementService,
    private readonly tostrService: ToastrService,
  ) {
    super(route, location);
  }

  ngOnInit(): void {
    this._subscriptions.push(
      this.hcpManagementService.responseAsObv.subscribe(resp => {
        if (resp) {
          this.open(this.hcpResToReqDialog, resp, 'single');
          this.hcpManagementService.setResponseToRequest(null);
        }
      }),
    );

    this._subscriptions.push(
      this.hcpManagementService.hcpInfoAsObv.subscribe(resp => {
        if (resp) {
          this.open(this.hcpProfileDialog, resp, 'single');
          this.hcpManagementService.setHcpInfo(null);
        }
      }),
    );
    this.getHcpNamesForFilter();
    this.itemsPerPage = 10;
    this.columnDefinition = hcpColumnDefinitions();
    this.getHcpRequests(this.currentPage, this.itemsPerPage);
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

  getHcpRequests(pageNo, itemsPerPage, form?) {
    if (form) {
      this.loading = true;
    }
    this._subscriptions.push(
      this.hcpManagementService
        .getHcpRequests(pageNo, itemsPerPage, this.filter)
        .subscribe(resp => {
          if (resp.length > 0) {
            this.getHcpRequestsCount();
            this.hcpRequests = resp;
            this.loading = false;
          } else {
            this.hcpManagementService
              .getHcpRequests(1, this.itemsPerPage, this.filter)
              .subscribe(
                res => {
                  this.getHcpRequestsCount();
                  this.hcpRequests = res;
                  this.loading = false;
                },
                error => {
                  this.loading = false;
                  form.reset();
                },
              );
            this.currentPage = 1;
          }
        }),
    );
  }

  getHcpRequestsCount() {
    this._subscriptions.push(
      this.hcpManagementService
        .getHcpRequestsCount(this.filter)
        .subscribe(resp => {
          this.totalHcpsCount = resp['count'];
        }),
    );
  }

  getHcpNamesForFilter() {
    this._subscriptions.push(
      this.hcpManagementService.getHcpListFiltered().subscribe(resp => {
        this.hcpNameList = [];
        resp.forEach(element => {
          this.hcpNameList.push(element);
          this.hcpNameList.sort((a, b) => a.fullName.localeCompare(b.fullName));
        });
      }),
    );
  }

  open(dialog: TemplateRef<NbDialogModule>, data: Object, type: string) {
    this.hcpId = [];
    this.hcpId.push(data['id']);
    if (data['action'] === 'approved' || data === 'success') {
      this.hcpReqDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: {
          message: `Are you sure you want to accept registration request from these users?`,
          status: 'approve',
          confirmMessage: 'Request Accepted',
          type: type,
        },
      });
    } else if (data['action'] === 'rejected' || data === 'default') {
      this.hcpReqDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: {
          message:
            'Are you sure you want to reject registration request from these users?',
          status: 'reject',
          confirmMessage: 'Request Rejected',
          type: type,
        },
      });
    } else {
      this.hcpProfileDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: data,
      });
    }
  }

  acceptOrRejectHCPRequest(singleRequest, responseStatus, updateFromList) {
    this.responseDialogLoding = true;
    if (!singleRequest) {
      this.selectedRows = this.gridApi.getSelectedRows();
      if (this.selectedRows.length > 0) {
        const selectedTeamId = [];
        this.selectedRows.forEach(team => {
          selectedTeamId.push(team.id);
        });
        this.hcpId = selectedTeamId;
      }
    }
    var refferalStatus = '';
    if (responseStatus === 'approve') {
      refferalStatus = 'approved';
    } else {
      refferalStatus = 'rejected';
    }
    this._subscriptions.push(
      this.hcpManagementService
        .respondToHcpRequest(this.hcpId, refferalStatus)
        .subscribe(resp => {
          if (resp['success']) {
            if (updateFromList) {
              this.responseDialogLoding = false;
              this.requestTemplateSwitch = true;
              this.rowChecked = false;
            } else {
              this.responseDialogLoding = false;
              this.hcpProfileDialogRef.close();
              this.tostrService.info(
                `HCP request has been ${refferalStatus}!`,
                'ATTENTION',
                {
                  timeOut: environment.messageTimeout,
                },
              );
            }
            this.getHcpRequests(this.currentPage, this.itemsPerPage);
            this.getHcpNamesForFilter();
          }
        }),
    );
  }

  onClearFilter(form) {
    this.isSearched = false;
    form.resetForm();
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
    this.getHcpRequests(this.currentPage, data);
  }

  onRowChecked(param) {
    if (param.api.getSelectedRows().length > 0) {
      this.rowChecked = true;
    } else {
      this.rowChecked = false;
    }
  }

  paginationEvent(pageNo) {
    this.currentPage = pageNo;
    if (!this.isSearched) {
      this.form.reset();
    }
    this.getHcpRequests(pageNo, this.itemsPerPage);
    window.scrollTo({top: 0, behavior: 'smooth'});
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
}
