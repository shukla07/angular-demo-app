import {Location} from '@angular/common';
import {
  Component,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {NgForm, NgModel} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {environment} from '@vmsl/env/environment';
import {ContentManagementService} from '@vmsl/shared/facades/content-management.service';
import {UserFacadeService} from '../../../shared/facades/user-facade.service';
import {ToastrService} from 'ngx-toastr';
import {Content} from '../shared/models/content-info.model';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {
  AccessRulesAssociation,
  UserInfo,
  AccessRules,
} from '@vmsl/core/auth/models/user.model';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {NbDialogModule, NbDialogRef, NbDialogService} from '@nebular/theme';
import {DivisionStates} from '@vmsl/core/enums/division-states.enum';
import {TherapeuticAreasService} from '@vmsl/shared/facades/therapeutic-areas.service';
import {DiseaseAreasService} from '@vmsl/shared/facades/disease-areas.service';
import {TerritoryManagementService} from '@vmsl/shared/facades/territory-management.service';
import {Territory} from '../../territories-management/shared/models/territory-info.model';
import {TherapeuticArea} from '../../therapeutic-areas-management/shared/models/therapeutic-area-info.model.ts';
import {DiseaseArea} from '../../disease-areas/shared/models/disease-area-info.model';
import {ProfileAccessRulesComponent} from '@vmsl/shared/components/profile-access-rules/profile-access-rules.component';
import {RoleName} from '@vmsl/core/enums';
import {TeamsFacadeService} from '../../../shared/facades/teams-facade.service';
import {TeamInfo} from '../../teams-management/shared/models/team-info.model';
import {NgxDropzoneComponent} from 'ngx-dropzone';
@Component({
  selector: 'vmsl-create-content',
  templateUrl: './create-content.component.html',
  styleUrls: ['./create-content.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreateContentComponent extends RouteComponentBase {
  title = 'Add Content';
  user = new UserInfo();
  contentRoute = '/main/content-management';
  content = new Content();
  contentBeforeEdit = new Content();
  contentId: string;
  userTabTitle: string;
  userTabTitleTeam: string;
  dsTagTabTitle: string;
  permissionKey = Permission;
  loadingPicture = false;
  territories: Territory[];
  hcps: UserInfo[];
  teams: TeamInfo[];
  therapeuticAreas: TherapeuticArea[];
  invalidDsTagField = [];
  invalidHcpTagField = [];
  invalidTeamsTagField = [];
  diseaseAreas: DiseaseArea[];
  dialogRef: NbDialogRef<NbDialogModule>;
  @ViewChild('dsTags', {static: false})
  dsTagsDialog: ProfileAccessRulesComponent;
  @ViewChild('teamsTags', {static: false})
  teamsTagsDialog: ProfileAccessRulesComponent;
  @ViewChild('hcpTags', {static: false})
  hcpTagsDialog: ProfileAccessRulesComponent;
  @ViewChild('dropzone', {static: false})
  dropzone: NgxDropzoneComponent;
  contentData: File;
  isHcp: boolean;
  blockError: boolean;
  isdsTagTitle = false;
  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly router: Router,
    protected readonly storeService: UserSessionStoreService,
    private readonly userFacadeService: UserFacadeService,
    private readonly teamsFacadeService: TeamsFacadeService,
    private readonly contentManagementService: ContentManagementService,
    private readonly territoryService: TerritoryManagementService,
    private readonly therapeuticAreaService: TherapeuticAreasService,
    private readonly diseasAreaService: DiseaseAreasService,
    private readonly toastrService: ToastrService,
    private readonly loaderService: NgxUiLoaderService,
    private readonly dialogService: NbDialogService,
  ) {
    super(route, location);
  }
  ngOnInit() {
    this.contentId = this.getRouteParam('id');
    if (this.contentId) {
      this.title = 'Update Content';
      this.getContents();
    }
  }

  onPictureUpload(event) {
    const maxSize = 30000000;
    this.loadingPicture = true;
    if (event.rejectedFiles && event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].size > maxSize) {
        this.toastrService.warning(
          'Maximum file size allowed is 30 MB.',
          'Exceeding file size',
          {
            timeOut: environment.messageTimeout,
          },
        );
      } else {
        this.toastrService.warning(
          'File format is not supported.',
          'Invalid file type.',
          {
            timeOut: environment.messageTimeout,
          },
        );
      }
      this.loadingPicture = false;
    } else {
      this.contentData = event.addedFiles;
      const formData = new FormData();
      formData.append('file', this.contentData[0]);
      this._subscriptions.push(
        this.contentManagementService.uploadContent(formData).subscribe(
          res => {
            this.loadingPicture = false;
            this.content.fileKey = res['fileKey'];
            this.content.fileType = res['fileType'];
          },
          err => {
            this.onRemove();
            this.loadingPicture = false;
            this.toastrService.error('Invalid file type.', 'ERROR', {
              timeOut: environment.messageTimeout,
            });
          },
        ),
      );
    }
  }

  onRemove() {
    this.contentData = null;
    if (!this.contentId) {
      this.content.fileKey = null;
      this.content.fileUrl = null;
      this.content.fileType = null;
    } else {
      this.content.fileKey = this.contentBeforeEdit.fileKey;
      this.content.fileType = this.contentBeforeEdit.fileType;
      this.content.fileUrl = this.contentBeforeEdit.fileUrl;
    }
  }
  validateForm() {
    this.blockError = false;
    if (
      !this.content.fileKey ||
      (!this.content.unrestricted &&
        !this.content.dsFlag &&
        !this.content.teamsFlag &&
        !this.content.hcpFlag)
    ) {
      this.blockError = true;
    }
    if (
      !this.content.unrestricted &&
      this.content.dsFlag &&
      !this.checkMendatoryFields(this.dsTagsDialog.accessRules, 'DSTags')
    ) {
      this.blockError = true;
    }
    if (
      !this.content.unrestricted &&
      this.content.hcpFlag &&
      !this.checkMendatoryFields(this.hcpTagsDialog.accessRules, 'HCPTags')
    ) {
      this.blockError = true;
    }
    if (
      !this.content.unrestricted &&
      this.content.teamsFlag &&
      !this.checkMendatoryFields(this.teamsTagsDialog.accessRules, 'TeamTags')
    ) {
      this.blockError = true;
    }
    return this.blockError;
  }

  addUpdateContent(form: NgForm) {
    if (form.invalid) {
      return;
    }
    if (this.validateForm()) {
      return;
    }

    this.allocateDsTags();
    if (this.contentId) {
      this._subscriptions.push(
        this.contentManagementService
          .editContent(this.content, this.contentId)
          .subscribe(resp => {
            this.toastrService.success(
              'Content Updated succesfully',
              'SUCCESS ',
              {
                timeOut: environment.messageTimeout,
              },
            );
            this.router.navigate([this.contentRoute]);
            this.loaderService.stop();
          }),
      );
    } else {
      this._subscriptions.push(
        this.contentManagementService
          .addContent(this.content)
          .subscribe(resp => {
            this.toastrService.success(
              'Content added succesfully',
              'SUCCESS ',
              {
                timeOut: environment.messageTimeout,
              },
            );
            this.router.navigate([this.contentRoute]);
            this.loaderService.stop();
          }),
      );
    }
  }
  clearInvalidTags(rule) {
    switch (rule) {
      case 'DSTags':
        this.invalidDsTagField = [];
        break;
      case 'HCPTags':
        this.invalidHcpTagField = [];
        break;
      case 'TeamTags':
        this.invalidTeamsTagField = [];
        break;
    }
  }
  checkMendatoryFields(accessRules: AccessRules[], rule: string) {
    var formValid = true;
    this.clearInvalidTags(rule);
    accessRules.forEach(accessRule => {
      if (
        accessRule.selected &&
        !accessRule.selected.length &&
        accessRule.associatedTo
      ) {
        switch (rule) {
          case 'DSTags':
            this.invalidDsTagField.push(` ${accessRule.titleName}`);
            formValid = false;
            break;
          case 'HCPTags':
            this.invalidHcpTagField.push(` ${accessRule.titleName}`);
            formValid = false;
            break;
          case 'TeamTags':
            this.invalidTeamsTagField.push(` ${accessRule.titleName}`);
            formValid = false;
            break;
        }
      }
    });
    return formValid;
  }

  allocateDsTags() {
    this.content.dsTags.forEach(dsTag => {
      if (dsTag.associatedTo === AccessRulesAssociation.all) {
        dsTag.selected = [];
        dsTag.elements = [];
      }
    });
  }

  getContents() {
    this.contentManagementService.getContentById(this.contentId).subscribe(
      res => {
        this.loaderService.stop();
        this.content = res;
        this.contentBeforeEdit = Object.assign({}, res);
      },
      err => {
        this.loaderService.stop();
        const goBackDelay = 2000;
        setTimeout(() => {
          window.location.href = '/main/content-management';
        }, goBackDelay);
      },
    );
  }

  getTabTitleValue(data, isUserTab: boolean) {
    if (isUserTab) {
      this.userTabTitle = data;
    } else {
      this.dsTagTabTitle = data;
    }
  }

  getTabTitleValueForTeams(data) {
    this.userTabTitleTeam = data;
  }

  handleDsTagLinking(
    accessRulesDialog: TemplateRef<NbDialogModule>,
    userTabSet: boolean,
  ) {
    this.invalidDsTagField = [];
    switch (this.dsTagTabTitle) {
      case DivisionStates.territory:
        this.openTerritoriesDialog(accessRulesDialog, userTabSet);
        break;
      case DivisionStates.therapeuticArea:
        this.openTherapeuticAreasDialog(accessRulesDialog, userTabSet);
        break;
      default:
        this.openDiseaseAreasDialog(accessRulesDialog, userTabSet);
        break;
    }
  }

  handleHcpsLinking(accessRulesDialog: TemplateRef<NbDialogModule>) {
    this.isHcp = true;
    this.isdsTagTitle = false;
    this.invalidHcpTagField = [];
    this.content.hcpTags.forEach(hcpTag => {
      this._subscriptions.push(
        this.userFacadeService
          .getUsersBasedOnRole(RoleName.hcp)
          .subscribe(resp => {
            this.openAcessRulesDialog(
              resp,
              accessRulesDialog,
              true,
              hcpTag.selected,
            );
            this.hcps = resp;
          }),
      );
    });
  }

  handleTeamsLinking(accessRulesDialog: TemplateRef<NbDialogModule>) {
    this.invalidTeamsTagField = [];
    this.isHcp = false;
    this.isdsTagTitle = false;
    this.content.teamsTags.forEach(teamsTag => {
      this._subscriptions.push(
        this.teamsFacadeService.getTeams(false).subscribe(resp => {
          this.openAcessRulesDialog(
            resp,
            accessRulesDialog,
            true,
            teamsTag.selected,
          );
          this.teams = resp;
        }),
      );
    });
  }

  openTerritoriesDialog(accessRulesDialog, userTabSet) {
    this.isdsTagTitle = true;
    this.content.dsTags.forEach(dsTag => {
      if (dsTag.titleName === this.dsTagTabTitle) {
        if (dsTag.associatedTo === AccessRulesAssociation.some) {
          this._subscriptions.push(
            this.territoryService.getTerritoriesFiltered().subscribe(resp => {
              this.openAcessRulesDialog(
                resp.filter(territory => territory.status),
                accessRulesDialog,
                userTabSet,
                dsTag.selected,
              );
              this.territories = resp.filter(territory => territory.status);
            }),
          );
        } else {
          this.linkingErrorToaster();
        }
      }
    });
  }

  openTherapeuticAreasDialog(accessRulesDialog, userTabSet) {
    this.isdsTagTitle = true;
    this.content.dsTags.forEach(dsTag => {
      if (dsTag.titleName === this.dsTagTabTitle) {
        if (dsTag.associatedTo === AccessRulesAssociation.some) {
          this._subscriptions.push(
            this.therapeuticAreaService
              .getTherapeuticAreasFiltered()
              .subscribe(resp => {
                this.openAcessRulesDialog(
                  resp.filter(therapeuticArea => therapeuticArea.status),
                  accessRulesDialog,
                  userTabSet,
                  dsTag.selected,
                );
                this.therapeuticAreas = resp.filter(
                  therapeuticArea => therapeuticArea.status,
                );
              }),
          );
        } else {
          this.linkingErrorToaster();
        }
      }
    });
  }

  openDiseaseAreasDialog(accessRulesDialog, userTabSet) {
    this.isdsTagTitle = true;
    this.content.dsTags.forEach(dsTag => {
      if (dsTag.titleName === this.dsTagTabTitle) {
        if (dsTag.associatedTo === AccessRulesAssociation.some) {
          this._subscriptions.push(
            this.diseasAreaService.getDiseaseAreasFiltered().subscribe(resp => {
              this.openAcessRulesDialog(
                resp.filter(diseaseAreas => diseaseAreas.status),
                accessRulesDialog,
                userTabSet,
                dsTag.selected,
              );
              this.diseaseAreas = resp.filter(
                diseaseAreas => diseaseAreas.status,
              );
            }),
          );
        } else {
          this.linkingErrorToaster();
        }
      }
    });
  }

  linkingErrorToaster() {
    let tabTitle;
    switch (this.dsTagTabTitle) {
      case DivisionStates.territory:
        tabTitle = 'Territories';
        break;
      case DivisionStates.diseaseArea:
        tabTitle = 'Product or Disease Areas';
        break;
      case DivisionStates.therapeuticArea:
        tabTitle = 'Therapeutic Areas';
        break;
    }
    this.toastrService.error(
      `You have already assigned all ${tabTitle}.`,
      'ATTENTION',
      {
        timeOut: environment.messageTimeout,
      },
    );
  }

  openAcessRulesDialog(
    data,
    accessRulesDialog,
    userTabSet: boolean,
    selectedElements,
  ) {
    this.dialogRef = this.dialogService.open(accessRulesDialog, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
      context: {
        dialogData: data,
        dialogTitle: this.getTabTitleForContent(userTabSet),
        isUserTab: userTabSet,
        selected: selectedElements,
      },
    });
  }

  getTabTitleForContent(userTabSet) {
    if (!userTabSet) {
      return this.dsTagTabTitle;
    }
    return this.isHcp ? this.userTabTitle : this.userTabTitleTeam;
  }

  removeListItem(data) {
    if (data.isUserTab) {
      switch (data.tabTitle) {
        case RoleName.hcp:
          this.content.hcpTags.forEach(relationship => {
            if (relationship.titleName === data.tabTitle) {
              relationship.elements = relationship.elements.filter(
                user => user.id !== data.listItem.id,
              );
              relationship.selected = relationship.selected.filter(
                userId => userId !== data.listItem.id,
              );
            }
          });
          break;
        case 'Team':
          this.content.teamsTags.forEach(team => {
            if (team.titleName === data.tabTitle) {
              team.elements = team.elements.filter(
                user => user.id !== data.listItem.id,
              );
              team.selected = team.selected.filter(
                userId => userId !== data.listItem.id,
              );
            }
          });
          break;
      }
    } else {
      this.content.dsTags.forEach(dsTag => {
        if (dsTag.titleName === data.tabTitle) {
          dsTag.elements = dsTag.elements.filter(
            user => user.id !== data.listItem.id,
          );
          dsTag.selected = dsTag.selected.filter(
            userId => userId !== data.listItem.id,
          );
        }
      });
    }
  }

  onSelectAll(event: NgModel, tabTitle: string) {
    switch (tabTitle) {
      case DivisionStates.territory:
        event.update.emit(this.territories.map(territory => territory.id));
        break;
      case DivisionStates.therapeuticArea:
        event.update.emit(
          this.therapeuticAreas.map(therapeuticArea => therapeuticArea.id),
        );
        break;
      case DivisionStates.diseaseArea:
        event.update.emit(this.diseaseAreas.map(diseaseArea => diseaseArea.id));
        break;
      case 'Team':
        event.update.emit(this.teams.map(team => team.teamId));
        break;
      case RoleName.hcp:
        event.update.emit(this.hcps.map(hcp => hcp.id));
        break;
    }
  }

  onClickAddAccessRules(dropdown, isUserTab) {
    if (!this.isdsTagTitle) {
      this.getSelectedTeamsHcps(dropdown);
    } else {
      this.content.dsTags.forEach(tag => {
        if (tag.titleName === dropdown.placeholder) {
          tag.elements = dropdown.selectedValues;
          tag.selected = dropdown.selectedValues.map(ele => ele.id);
        }
      });
    }
    this.dialogRef.close();
  }

  getSelectedTeamsHcps(dropdown) {
    if (this.isHcp) {
      this.content.hcpTags.forEach(user => {
        if (user.titleName === dropdown.placeholder) {
          user.elements = dropdown.selectedValues.map(ele => {
            return {
              id: ele.id,
              name: ele.fullName,
            };
          });
          user.selected = dropdown.selectedValues.map(ele => ele.id);
        }
      });
    } else {
      this.content.teamsTags.forEach(team => {
        if (team.titleName === dropdown.placeholder) {
          team.elements = dropdown.selectedValues.map(ele => {
            return {
              id: ele.teamId,
              name: ele.teamName,
            };
          });
          team.selected = dropdown.selectedValues.map(ele => ele.teamId);
        }
      });
    }
  }

  resetOthers() {
    this.content.dsFlag = false;
    this.content.hcpFlag = false;
    this.content.teamsFlag = false;
  }
  onClearAll(event) {
    event.update.emit([]);
  }

  cancel(form) {
    if (this.contentId) {
      this.getContents();
    } else {
      this.blockError = false;
      this.contentData = null;
      this.content.fileKey = null;
      this.content.fileUrl = null;
      this.content.fileType = null;
      form.resetForm();
    }
  }
}
