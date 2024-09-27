import { Location } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouteComponentBase } from '@vmsl/core/route-component-base';
import {
  pageLimitMaxThousand,
  limitTen,
} from '@vmsl/shared/model/items-per-page-list';
import { Permission } from '@vmsl/core/auth/permission-key.enum';
import { IVmslGridColumn } from '@vmsl/shared/vmsl-grid/wrapper-interfaces';
import { Observable, Subject } from 'rxjs';
import { columnDefinitions } from '../../../../app/main/content-management/shared/models/content-management-grid-header';
import { Content } from '../../../../app/main/content-management/shared/models/content-info.model';
import { ContentManagementService } from '@vmsl/shared/facades/content-management.service';
import { Status } from '@vmsl/core/enums/status.enum';
import { TerritoryManagementService } from '@vmsl/shared/facades/territory-management.service';
import { TherapeuticAreasService } from '@vmsl/shared/facades/therapeutic-areas.service';
import { TherapeuticArea } from '../../../../app/main/therapeutic-areas-management/shared/models/therapeutic-area-info.model.ts';
import { DiseaseAreasService } from '@vmsl/shared/facades/disease-areas.service';
import { DiseaseArea } from '../../../../app/main/disease-areas/shared/models/disease-area-info.model';
import { ContentType, RoleName } from '@vmsl/core/enums';
import { Territory } from '../../../../app/main/territories-management/shared/models/territory-info.model';
import { CommonService } from '@vmsl/shared/facades/common.service';
import { TeamsManagementService } from '../../../../app/main/teams-management/shared/teams-management.service';
import { TeamInfo } from '../../../../app/main/teams-management/shared/models/team-info.model';
import { NbDialogRef } from '@nebular/theme';
import { UserFacadeService } from '@vmsl/shared/facades/user-facade.service';
import { UserInfo } from '@vmsl/core/auth/models/user.model';
import { UserSessionStoreService } from '@vmsl/core/store/user-session-store.service';

@Component({
  selector: 'vmsl-content-popup',
  templateUrl: './content-popup.component.html',
  styleUrls: ['./content-popup.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ContentPopupComponent extends RouteComponentBase {
  permissionKey = Permission;
  titleList: Content[];
  teamsNameList: TeamInfo[];
  contents: Content[];
  contentNameList: Observable<Content[]>;
  itemsPerPage: number;
  currentPage = 1;
  totalTitlesCount: number;
  columnDefinition: IVmslGridColumn[];
  noRowsTemplate = '<span>No Content Found</span>';
  dropdownCount: Subject<number> = new Subject<number>();
  rowChecked = false;
  loading = false;
  gridApi;
  gridColumnApi;
  itemsPerPageList = pageLimitMaxThousand;
  contentId: string;
  selectedRows: Content[];
  filter = {
    contentId: [],
    status: null,
    term: '',
    territories: [],
    therapeuticAreas: [],
    diseaseAreas: [],
    fileType: null,
    teamsNameList: [],
    hcps: [],
  };
  orderFilter = [];
  contentSearchStr = new Subject<string | null>();
  contentEnum = Status;
  territories: Territory[];
  therapeuticAreas: TherapeuticArea[];
  diseaseAreas: DiseaseArea[];
  hcps: UserInfo[];
  fileTypes = [];
  territoryId: string;
  diseaseAreaId: string;
  therapeuticAreaId: string;
  fileType: string;
  teamId: string;
  inMail: boolean;
  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly contentService: ContentManagementService,
    private readonly diseaseAreasService: DiseaseAreasService,
    private readonly therapeuticAreasService: TherapeuticAreasService,
    private readonly territoryService: TerritoryManagementService,
    private readonly commonService: CommonService,
    private readonly teamsManageService: TeamsManagementService,
    private readonly store: UserSessionStoreService,
    private readonly userFacadeService: UserFacadeService,
    protected dialogRef: NbDialogRef<ContentPopupComponent>,
    private readonly diseasAreaService: DiseaseAreasService,
    private readonly therapeuticAreaService: TherapeuticAreasService,
  ) {
    super(route, location);
    this.contentSearchStr.subscribe(res => {
      if (res) {
        this.filter.term = res;
        this.getContentNamesForFilter();
      }
    });
    for (var type in ContentType) {
      this.fileTypes.push({
        id: type,
        value:
          type === ContentType.others
            ? `${type.charAt(0).toUpperCase() + type.slice(1)} (.vcf,.ics)`
            : type.charAt(0).toUpperCase() + type.slice(1),
      });
    }

    this._subscriptions.push(
      this.contentService.titleSortObv.subscribe(resp => {
        if (resp) {
          this.sortContentList(resp);
          this.contentService.setContentSort(null);
        }
      }),
    );
    super.ngOnInit();
    this.getFilteredContent();
    this.getUserTags();
    this.getTeamNamesForFilter();
    if (
      this.store
        .getUser()
        .permissions.includes(this.permissionKey.CreateTenantContents)
    ) {
      this.getHcpForFilter();
    }
    this.columnDefinition = columnDefinitions();
    this.itemsPerPage = limitTen;
    this.getContentList(this.currentPage, this.itemsPerPage);
  }

  getUserTags() {
    this.userFacadeService
      .getUserById(this.store.getUser().id)
      .subscribe(res => {
        // get ds tags from reposnse.
        const dsTags = res.dsTags;

        /**
         * When both association and divison tags are assigned to user.
         * then while getting userinfo we get the dstags for user as
         * return [territory, ta, da];
         * as defined in user-adapter.service.ts, please check that.
         * which means at array index 0 is for territory tag.
         * array index 1 is for therapeutic area tag.
         * array index 2 is for disease area tag.
         * when All tags is on any for these tags, then that tag associatedTo comes as 0 in response.
         * and in content management we were not getting the all options listed in for filter for that
         * tag filter.
         *
         * i.e we are checking that 0,1,2 indexes associatedTo and if its zero, then we are getting
         * all tags name for correspondiing ds tags
         */

        // check associatedTo 0 for 1 index ie. for therapeutic areas.
        if (!dsTags[1].associatedTo) {
          // associatedTo 0 for 1 index, get all therapeutic areas for tenant and assign it to
          // therapeutic areas filter
          this.therapeuticAreaService.getTherapeuticAreasFiltered().subscribe(tas => {
            // assign all therapeutic areas for tenant to therapeutic areas filter.
            this.therapeuticAreas = tas;
          });
        }
        else {
          // associatedTo is not 0 for 1 index, just set the response therapeutic areas to
          // therapeutic areas filter.
          this.therapeuticAreas = res.therapeuticAreas;
        }

        // check associatedTo 0 for 0 index ie. for territories.
        if (!dsTags[0].associatedTo) {
          // associatedTo 0 for 0 index, get all territories for tenant and assign it to territories
          // filter
          this.territoryService.getTerritoriesFiltered().subscribe(territories => {
            // assign all territories for tenant to territories filter.
            this.territories = territories;
          });
        }
        else {
          // associatedTo is not 0 for 0 index, just set the response territories to territories
          // filter.
          this.territories = res.territory;
        }

        const two = 2;
        // check associatedTo 0 for 2 index ie. for disease area.
        if (!dsTags[two].associatedTo) {
          // associatedTo 0 for 2 index, get all disease area for tenant and assign it to disease
          // areas filter
          this.diseasAreaService.getDiseaseAreasFiltered().subscribe(das => {
            // assign all disease areas for tenant to disease areas filter.
            this.diseaseAreas = das;
          });
        }
        else {
          // associatedTo is not 0 for 2 index, just set the response disease areas to disease areas
          // filter.
          this.diseaseAreas = res.diseaseAreas;
        }
      });
  }
  getContentNamesForFilter() {
    this.contentNameList = this.contentService.getFilteredContentList(
      null,
      null,
      this.filter,
      ['title ASC'],
    );
  }
  getFilteredTerritories() {
    this._subscriptions.push(
      this.territoryService.getTerritoriesFiltered().subscribe(resp => {
        this.territories = resp;
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
  getFiltereddiseaseAreas() {
    this._subscriptions.push(
      this.diseaseAreasService.getDiseaseAreasFiltered().subscribe(resp => {
        this.diseaseAreas = resp;
      }),
    );
  }

  getHcpForFilter() {
    this._subscriptions.push(
      this.userFacadeService
        .getUsersBasedOnRole(RoleName.hcp)
        .subscribe(resp => {
          this.hcps = resp;
        }),
    );
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

  getContentList(pageNo, itemsPerPage, form?) {
    if (form) {
      this.loading = true;
    }
    this._subscriptions.push(
      this.contentService
        .getFilteredContentList(
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
            this.contentService
              .getFilteredContentList(
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
      this.contentService.getTitlesCount(this.filter).subscribe(resp => {
        this.totalTitlesCount = resp['count'];
      }),
    );
  }

  getFilteredContent() {
    this._subscriptions.push(
      this.contentService.getContentFiltersFiltered().subscribe(resp => {
        this.contents = resp;
      }),
    );
  }

  sortContentList(resp) {
    this.orderFilter = this.orderFilter.filter(
      item => !item.includes(resp.columnName),
    );
    if (resp.sort !== 'none') {
      this.orderFilter.unshift(`${resp.columnName} ${resp.sort}`);
    }
    this.getContentList(this.currentPage, this.itemsPerPage, this.filter);
  }

  onClearFilter(form) {
    form.resetForm();
    this.filter.term = '';
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
    this.getContentList(this.currentPage, data);
  }

  paginationEvent(pageNo) {
    this.currentPage = pageNo;
    this.getContentList(pageNo, this.itemsPerPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onRowChecked(param) {
    if (param.api.getSelectedRows().length > 0) {
      this.rowChecked = true;
    } else {
      this.rowChecked = false;
    }
  }

  setContentData() {
    if (this.inMail) {
      this.commonService.setContentInMail(this.gridApi.getSelectedRows());
    } else {
      this.commonService.setContentInChat(this.gridApi.getSelectedRows());
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
  close() {
    this.dialogRef.close();
  }
}
