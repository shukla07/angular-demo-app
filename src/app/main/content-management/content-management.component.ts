import { Location } from '@angular/common';
import {
  Component,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NbDialogModule, NbDialogRef, NbDialogService } from '@nebular/theme';
import { Permission } from '@vmsl/core/auth/permission-key.enum';
import { RouteComponentBase } from '@vmsl/core/route-component-base';
import { limitTwelve } from '@vmsl/shared/model/items-per-page-list';
import { Observable, Subject } from 'rxjs';
import { Content } from './shared/models/content-info.model';
import { ContentManagementService } from '@vmsl/shared/facades/content-management.service';
import { Territory } from '../territories-management/shared/models/territory-info.model';
import { Status } from '@vmsl/core/enums/status.enum';
import { NgForm } from '@angular/forms';
import { TerritoryManagementService } from '@vmsl/shared/facades/territory-management.service';
import { TherapeuticAreasService } from '@vmsl/shared/facades/therapeutic-areas.service';
import { TherapeuticArea } from '../therapeutic-areas-management/shared/models/therapeutic-area-info.model.ts';
import { DiseaseAreasService } from '@vmsl/shared/facades/disease-areas.service';
import { DiseaseArea } from '../disease-areas/shared/models/disease-area-info.model';
import { ContentType, RoleName } from '@vmsl/core/enums';
import { TeamInfo } from '../teams-management/shared/models/team-info.model';
import { TeamsManagementService } from '../teams-management/shared/teams-management.service';
import { UserFacadeService } from '@vmsl/shared/facades/user-facade.service';
import { UserInfo } from '@vmsl/core/auth/models/user.model';
import { UserSessionStoreService } from '@vmsl/core/store/user-session-store.service';

@Component({
  selector: 'vmsl-content-management',
  templateUrl: './content-management.component.html',
  styleUrls: ['./content-management.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ContentManagementComponent extends RouteComponentBase {
  permissionKey = Permission;
  title = '';
  titleList: Content[] = [];
  contents: Content[] = [];
  territories: Territory[];
  teamsNameList: TeamInfo[];
  therapeuticAreas: TherapeuticArea[];
  diseaseAreas: DiseaseArea[];
  hcps: UserInfo[];
  fileTypes = [];
  contentNameList: Observable<Content[]>;
  itemsPerPage: number;
  currentPage = 1;
  totalTitlesCount: number;
  territoryId: string;
  dropdownCount: Subject<number> = new Subject<number>();
  loading = false;
  contentId: string;
  fileType: string;
  statusTemplateSwitch = false;
  deleteTemplateSwitch = false;
  isSearched = false;
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
  contentEnum = Status;
  contentSearchStr = new Subject<string | null>();
  @ViewChild('form') form: NgForm;
  @ViewChild('contentStatusDialog', { read: TemplateRef })
  contentStatusDialog: TemplateRef<NbDialogModule>;
  @ViewChild('deleteContentDeleteDialog', { read: TemplateRef })
  deleteContentDeleteDialog: TemplateRef<NbDialogModule>;
  deleteDialogRef: NbDialogRef<NbDialogModule>;
  statusDialogRef: NbDialogRef<NbDialogModule>;

  constructor(
    private readonly router: Router,
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly contentService: ContentManagementService,
    private readonly diseaseAreasService: DiseaseAreasService,
    private readonly therapeuticAreasService: TherapeuticAreasService,
    private readonly territoryService: TerritoryManagementService,
    private readonly dialogService: NbDialogService,
    private readonly teamsManageService: TeamsManagementService,
    private readonly userFacadeService: UserFacadeService,
    private readonly store: UserSessionStoreService,
    private readonly therapeuticAreaService: TherapeuticAreasService,
    private readonly diseasAreaService: DiseaseAreasService
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
  }

  ngOnInit() {
    this._subscriptions.push(
      this.contentService.contentStatusObv.subscribe(resp => {
        if (resp) {
          this.open(this.contentStatusDialog, resp, 'single');
          this.contentService.setContentStatus(null);
        }
      }),
    );

    this._subscriptions.push(
      this.contentService.contentDeleteObv.subscribe(resp => {
        if (resp) {
          this.open(this.deleteContentDeleteDialog, resp, 'single');
          this.contentService.setContentToBeDeleted(null);
        }
      }),
    );

    this._subscriptions.push(
      this.contentService.titleSortObv.subscribe(resp => {
        if (resp) {
          this.contentService.setContentSort(null);
        }
      }),
    );
    super.ngOnInit();
    this.getFilteredContent();
    this.getTeamNamesForFilter();
    if (
      this.store
        .getUser()
        .permissions.includes(this.permissionKey.CreateTenantContents)
    ) {
      this.title = 'Content Management';
      this.getFilteredTherapeuticAreas();
      this.getFiltereddiseaseAreas();
      this.getFilteredTerritories();
      this.getHcpForFilter();
    } else {
      this.title = 'Content';
      this.getUserTags();
    }
    this.itemsPerPage = limitTwelve;
    this.getContentList(this.currentPage, this.itemsPerPage);
  }

  getContentNamesForFilter() {
    this.contentNameList = this.contentService.getFilteredContentList(
      null,
      null,
      this.filter,
      ['title ASC'],
    );
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

  getFilteredTerritories() {
    this._subscriptions.push(
      this.territoryService.getTerritoriesFiltered().subscribe(resp => {
        this.territories = resp;
      }),
    );
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
  getHcpForFilter() {
    this._subscriptions.push(
      this.userFacadeService
        .getUsersBasedOnRole(RoleName.hcp)
        .subscribe(resp => {
          this.hcps = resp;
        }),
    );
  }

  getContentList(pageNo, itemsPerPage, form?) {
    if (form) {
      this.loading = true;
    }
    this._subscriptions.push(
      this.contentService
        .getFilteredContentList(pageNo, itemsPerPage, this.filter, null)
        .subscribe(resp => {
          if (resp.length > 0) {
            this.titleList = resp;
            this.getTitlesCount();
            this.loading = false;
          } else {
            this.contentService
              .getFilteredContentList(1, itemsPerPage, this.filter, null)
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

  // ng-select on select item
  onSelectChange() {
    const selectedElement = document.querySelector(
      'ng-select.ng-select-filtered',
    );
    if (selectedElement !== null) {
      selectedElement.classList.remove('ng-select-filtered');
    }
  }

  open(dialog: TemplateRef<NbDialogModule>, data: Object, type: string) {
    this.contentId = data['contentId'];
    if (data['contentName']) {
      this.deleteDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: {
          message: `Do you really want to delete ${data['contentName']}?`,
          status: 'delete',
          confirmMessage: `${data['contentName']} has been deleted!`,
        },
      });
    } else if (
      data['status'] === this.contentEnum.inactive ||
      data === 'success'
    ) {
      this.statusDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: {
          message: 'Do you really want to activate selected content /contents?',
          status: 'activate',
          confirmMessage: 'content /contents has been activated',
          type: type,
        },
      });
    } else if (
      data['status'] === this.contentEnum.active ||
      data === 'danger'
    ) {
      this.statusDialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        context: {
          message:
            'Do you really want to deactivate selected content /contents?',
          status: 'deactivate',
          confirmMessage: 'content /contents has been deactivated',
          type: type,
        },
      });
    } else {
      // empty else block
    }
  }

  activOrDeactivContent() {
    let content = new Content();
    this._subscriptions.push(
      this.contentService.getContentById(this.contentId).subscribe(res => {
        content = res;
        if (content.status === 0) {
          content.status = this.contentEnum.active;
        } else {
          content.status = this.contentEnum.inactive;
        }
        this.contentService
          .editContent(content, this.contentId)
          .subscribe(() => {
            this.getContentList(this.currentPage, this.itemsPerPage);
            this.statusTemplateSwitch = true;
          });
      }),
    );
  }

  deleteContent() {
    this._subscriptions.push(
      this.contentService.deleteContent(this.contentId).subscribe(resp => {
        if (resp['success']) {
          this.getContentList(this.currentPage, this.itemsPerPage);
          this.deleteTemplateSwitch = true;
          this.getFilteredContent();
        }
      }),
    );
  }

  exportContent(exportType: string) {
    this._subscriptions.push(
      this.contentService
        .exportContentList(this.filter, exportType)
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

  onClickAddContent() {
    this.router.navigate(['/main/content-management/add']);
  }

  onClearFilter(form) {
    form.resetForm();
    this.filter.term = '';
    this.isSearched = false;
    this.itemsPerPage = limitTwelve;
    this.currentPage = 1;
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
    if (!this.isSearched) {
      this.form.reset();
    }
    this.currentPage = pageNo;
    this.getContentList(pageNo, this.itemsPerPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onClickStatus(radioButton, id) {
    this.contentService.setContentStatus({
      status: radioButton,
      contentId: id,
    });
  }

  edit(id) {
    this.router.navigate([`/main/content-management/edit/${id}`]);
  }

  delete(id, title) {
    this.contentService.setContentToBeDeleted({
      contentName: title,
      contentId: id,
    });
  }

  view(id) {
    this.router.navigate([`/main/content-management/view/${id}`]);
  }

  download(id) {
    this._subscriptions.push(
      this.contentService.getContentById(id).subscribe(resp => {
        const downloadLink = document.createElement('a');
        downloadLink.download = 'download';
        downloadLink.href = resp['fileUrl'];
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }),
    );
  }
}
