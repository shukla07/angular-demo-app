import {
  Component,
  ViewEncapsulation,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {environment} from '@vmsl/env/environment';
import {NbDialogModule, NbDialogService, NbDialogRef} from '@nebular/theme';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {Subject, ReplaySubject} from 'rxjs';
import {IVmslGridColumn} from '@vmsl/shared/vmsl-grid/wrapper-interfaces';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {NgForm} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {Location} from '@angular/common';
import {TeamInfo} from './shared/models/team-info.model';
import {columnDefinitions} from './shared/models/teams-grid-header';
import {pageLimitMaxThousand} from '@vmsl/shared/model/items-per-page-list';
import {TeamsManagementService} from './shared/teams-management.service';

@Component({
  selector: 'vmsl-teams-management',
  templateUrl: './teams-management.component.html',
  styleUrls: ['./teams-management.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TeamsManagementComponent extends RouteComponentBase {
  teamsList: TeamInfo[];
  title = "Team's List";
  columnDefinition: IVmslGridColumn[];
  rowChecked = false;
  statusTemplateSwitch = false;
  deleteTemplateSwitch = false;
  teamId: string;
  gridApi;
  gridColumnApi;
  itemsPerPage: number;
  permissionKey = Permission;
  currentPage = 1;
  totalTeamsCount: number;
  teamsNameList: TeamInfo[];
  loading = false;
  selectedRows: TeamInfo[];
  csvFile: File;
  filter = {
    teamId: null,
  };
  noRowsTemplate: string;
  orderFilter = [];
  itemsPerPageList = pageLimitMaxThousand;
  isSearched = false;
  dropdownCount: Subject<number> = new Subject<number>();
  deleteDialogRef: NbDialogRef<NbDialogModule>;
  statusDialogRef: NbDialogRef<NbDialogModule>;
  private readonly destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  @ViewChild('teamStatusDialog', {read: TemplateRef})
  teamStatusDialog: TemplateRef<NbDialogModule>;
  @ViewChild('form') form: NgForm;
  @ViewChild('deleteTeamDialog', {read: TemplateRef})
  deleteTeamDialog: TemplateRef<NbDialogModule>;
  @ViewChild('csvDropZone', {read: TemplateRef})
  csvDropZone: TemplateRef<NbDialogModule>;

  constructor(
    private readonly router: Router,
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly dialogService: NbDialogService,
    private readonly tostr: ToastrService,
    private readonly teamsManageService: TeamsManagementService,
  ) {
    super(route, location);
  }

  ngOnInit() {
    this.noRowsTemplate = '<span>No Teams Found</span>';

    this._subscriptions.push(
      this.teamsManageService.teamStatusObv.subscribe(resp => {
        if (resp) {
          this.open(this.teamStatusDialog, resp, 'single');
          this.teamsManageService.setTeamStatus(null);
        }
      }),
    );

    this._subscriptions.push(
      this.teamsManageService.teamDeleteObv.subscribe(resp => {
        if (resp) {
          this.open(this.deleteTeamDialog, resp, 'single');
          this.teamsManageService.setTeamToBeDeleted(null);
        }
      }),
    );

    this._subscriptions.push(
      this.teamsManageService.teamsSortObv.subscribe(resp => {
        if (resp) {
          this.sortTeamsList(resp);
          this.teamsManageService.setTeamsListSort(null);
        }
      }),
    );

    this.columnDefinition = columnDefinitions();
    this.itemsPerPage = 10;
    this.getTeamsList(this.currentPage, this.itemsPerPage);
    this.getTeamNamesForFilter();
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

  getTeamNamesForFilter() {
    this._subscriptions.push(
      this.teamsManageService.getTeamsList().subscribe(resp => {
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

  sortTeamsList(resp) {
    this.orderFilter = this.orderFilter.filter(
      item => !item.includes(resp.columnName),
    );
    if (resp.sort !== 'none') {
      this.orderFilter.unshift(`${resp.columnName} ${resp.sort}`);
    }
    this.getTeamsList(this.currentPage, this.itemsPerPage, this.filter);
  }

  getPaginationValue(data) {
    this.itemsPerPage = data;
    this.getTeamsList(this.currentPage, data);
  }

  onRowChecked(param) {
    if (param.api.getSelectedRows().length > 0) {
      this.rowChecked = true;
    } else {
      this.rowChecked = false;
    }
  }

  onClickAddTeam() {
    this.router.navigate(['/main/teams-management/add']);
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

  checkColumnSelection(exportType: string) {
    this.selectedRows = this.gridApi.getSelectedRows();
    const maxExportRowsLimit = 5;
    if (this.selectedRows.length) {
      if (this.selectedRows.length <= maxExportRowsLimit) {
        this.filter.teamId = [];
        this.selectedRows.forEach(team => {
          this.filter.teamId.push(team.teamId);
        });
        this.exportTeamsList(exportType);
      } else {
        this.tostr.warning('Please select 5 or less teams.', 'Attention', {
          timeOut: environment.messageTimeout,
        });
      }
    } else {
      this.exportTeamsList(exportType);
    }
  }

  exportTeamsList(exportType) {
    this._subscriptions.push(
      this.teamsManageService
        .exportTeamList(this.filter, this.orderFilter, exportType)
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

  open(dialog: TemplateRef<NbDialogModule>, data: Object, type: string) {
    this.teamId = data['id'];
    if (data['teamName']) {
      this.deleteDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: {
          message: `Do you really want to delete ${data['teamName']}?`,
          status: 'delete',
          confirmMessage: `${data['teamName']} has been deleted`,
        },
      });
    } else if (data['status'] === 0 || data === 'success') {
      this.statusDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: {
          message: 'Do you really want to activate selected team/teams?',
          status: 'activate',
          confirmMessage: 'Team(s) has been activated',
          type: type,
        },
      });
    } else if (data['status'] === 1 || data === 'danger') {
      this.statusDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: {
          message: 'Do you really want to deactivate selected team/teams?',
          status: 'deactivate',
          confirmMessage: 'Team has been deactivated',
          type: type,
        },
      });
    } else {
      // empty else block
    }
  }

  activOrDeactivTeam() {
    let team = new TeamInfo();
    this._subscriptions.push(
      this.teamsManageService.getTeamById(this.teamId).subscribe(res => {
        team = res;
        if (team.status === 0) {
          team.status = 1;
        } else {
          team.status = 0;
        }
        this.teamsManageService.editTeam(team, this.teamId).subscribe(() => {
          this.getTeamsList(this.currentPage, this.itemsPerPage);
          this.statusTemplateSwitch = true;
        });
      }),
    );
  }

  bulkTeamStatusChange(status) {
    this.selectedRows = this.gridApi.getSelectedRows();
    if (this.selectedRows.length > 0) {
      const selectedTeamId = [];
      this.selectedRows.forEach(team => {
        selectedTeamId.push(team.teamId);
      });
      const updatedStatus = status === 'deactivate' ? 0 : 1;
      const teamData = {id: selectedTeamId, status: updatedStatus};
      this.teamsManageService.updateBulkTeamStatus(teamData).subscribe(resp => {
        if (resp['success']) {
          this.getTeamsList(this.currentPage, this.itemsPerPage);
          this.statusTemplateSwitch = true;
          this.rowChecked = false;
        }
      });
    }
  }

  deleteTeam() {
    this._subscriptions.push(
      this.teamsManageService.deleteTeam(this.teamId).subscribe(resp => {
        if (resp['success']) {
          this.getTeamsList(this.currentPage, this.itemsPerPage);
          this.deleteTemplateSwitch = true;
          this.rowChecked = false;
          this.getTeamNamesForFilter();
        }
      }),
    );
  }

  getTeamsList(pageNo, itemsPerPage, form?) {
    if (form) {
      this.loading = true;
    }
    this._subscriptions.push(
      this.teamsManageService
        .getFilteredTeamsList(
          pageNo,
          itemsPerPage,
          this.filter,
          this.orderFilter,
        )
        .subscribe(resp => {
          if (resp.length > 0) {
            this.getTeamsListCount();
            this.teamsList = resp;
            this.loading = false;
          } else {
            this.teamsManageService
              .getFilteredTeamsList(
                1,
                itemsPerPage,
                this.filter,
                this.orderFilter,
              )
              .subscribe(
                res => {
                  this.getTeamsListCount();
                  this.teamsList = res;
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

  getTeamsListCount() {
    this._subscriptions.push(
      this.teamsManageService.getTeamsCount(this.filter).subscribe(resp => {
        this.totalTeamsCount = resp['count'];
      }),
    );
  }

  paginationEvent(pageNo) {
    this.currentPage = pageNo;
    if (!this.isSearched) {
      this.form.reset();
    }
    this.getTeamsList(pageNo, this.itemsPerPage);
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
