import {
  Component,
  ViewEncapsulation,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {UserFacadeService} from '@vmsl/shared/facades/user-facade.service';
import {
  AccessRulesAssociation,
  DsFlags,
} from '@vmsl/core/auth/models/user.model';
import {NgForm, NgModel} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {environment} from '@vmsl/env/environment';
import { TeamInfo, AccessRules } from '../shared/models/team-info.model';
import {TeamsManagementService} from '../shared/teams-management.service';
import {timezones} from '../../../../assets/array/timezones';
import {Territory} from '../../territories-management/shared/models/territory-info.model';
import {DiseaseArea} from '../../disease-areas/shared/models/disease-area-info.model';
import {TherapeuticArea} from '../../therapeutic-areas-management/shared/models/therapeutic-area-info.model.ts';
import {DiseaseAreasService} from '@vmsl/shared/facades/disease-areas.service';
import {TerritoryManagementService} from '@vmsl/shared/facades/territory-management.service';
import {TherapeuticAreasService} from '@vmsl/shared/facades/therapeutic-areas.service';
import {NbDialogRef, NbDialogModule, NbDialogService} from '@nebular/theme';
import {ProfileAccessRulesComponent} from '@vmsl/shared/components/profile-access-rules/profile-access-rules.component';
import {DivisionStates} from '@vmsl/core/enums/division-states.enum';

@Component({
  selector: 'vsml-teams',
  templateUrl: './create-team.component.html',
  styleUrls: ['./create-team.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreateTeamComponent extends RouteComponentBase {
  title = 'Add Team';
  teamRoute = '/main/teams-management';
  team = new TeamInfo();
  teamId: string;
  timeZoneList = timezones;
  territories: Territory[];
  therapeuticAreas: TherapeuticArea[];
  diseaseAreas: DiseaseArea[];
  dsFlag = DsFlags;
  userTabTitle: string;
  dsTagTabTitle: string;
  dialogRef: NbDialogRef<NbDialogModule>;
  @ViewChild('dsTags', {static: false}) dsTags: ProfileAccessRulesComponent;
  @ViewChild('linkedUsers', {static: false})
  linkedUsers: ProfileAccessRulesComponent;
  invalidUserField = [];
  invalidDsTagField = [];

  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly router: Router,
    protected readonly storeService: UserSessionStoreService,
    private readonly userService: UserFacadeService,
    private readonly teamsManagementService: TeamsManagementService,
    private readonly toastrService: ToastrService,
    private readonly territoryService: TerritoryManagementService,
    private readonly therapeuticAreaService: TherapeuticAreasService,
    private readonly diseasAreaService: DiseaseAreasService,
    private readonly dialogService: NbDialogService,
  ) {
    super(route, location);
  }
  ngOnInit() {
    this.teamId = this.getRouteParam('id');
    if (this.teamId) {
      this.title = 'Update Team';
      this.getTeam();
    }
  }

  addUpdateTeam(form: NgForm) {
    if (form.invalid) {
      form.form.controls['timeZone'].markAsTouched();
      return;
    }
    if (this.team.dsFlag === this.dsFlag.Both) {
      if (
        !(
          this.checkMendatoryFields(this.dsTags.accessRules) &&
          this.checkMendatoryFields(this.linkedUsers.accessRules)
        )
      ) {
        return;
      }
    } else {
      if (!this.checkMendatoryFields(this.linkedUsers.accessRules)) {
        return;
      }
    }
    this.allocateDsTags();
    if (this.teamId) {
      this._subscriptions.push(
        this.teamsManagementService
          .editTeam(this.team, this.teamId)
          .subscribe(resp => {
            this.toastrService.success('Team Updated succesfully', 'SUCCESS ', {
              timeOut: environment.messageTimeout,
            });
            this.router.navigate([this.teamRoute]);
          }),
      );
    } else {
      this._subscriptions.push(
        this.teamsManagementService.addTeam(this.team).subscribe(resp => {
          this.toastrService.success('Team added succesfully', 'SUCCESS ', {
            timeOut: environment.messageTimeout,
          });
          this.router.navigate([this.teamRoute]);
        }),
      );
    }
  }

  checkMendatoryFields(accessRules: AccessRules[]) {
    var formValid = true;
    accessRules.forEach(accessRule => {
      if (accessRule.associatedTo === AccessRulesAssociation.na && accessRule.titleName !== 'Health Care Professional') {
        if (!accessRule.selected.length) {
          this.invalidUserField.push(` ${accessRule.titleName}`);
          formValid = false;
        }
      } else if (accessRule.associatedTo === AccessRulesAssociation.some && accessRule.titleName !== 'Health Care Professional') {
        if (!accessRule.selected.length) {
          this.invalidDsTagField.push(` ${accessRule.titleName}`);
          formValid = false;
        }
      } else {
        //empty else block.
      }
    });
    return formValid;
  }

  getTeam() {
    this.teamsManagementService.getTeamById(this.teamId).subscribe(
      res => {
        this.team = res;
      },
      err => {
        const goBackDelay = 2000;
        setTimeout(function () {
          window.location.href = '/main/teams-management';
        }, goBackDelay);
      },
    );
  }

  allocateDsTags() {
    this.team.dsTags.forEach(dsTag => {
      if (dsTag.associatedTo === AccessRulesAssociation.all) {
        dsTag.selected = [];
        dsTag.elements = [];
      }
    });
  }

  searchResults(
    accessRulesDialog: TemplateRef<NbDialogModule>,
    userTabSet: boolean,
  ) {
    if (userTabSet) {
      var selectedUsers = [];
      this.team.linkedUsers.forEach(user => {
        if (user.titleName === this.userTabTitle) {
          selectedUsers = user.selected;
        }
      });
      this.userService
        .getUsersBasedOnRole(this.userTabTitle)
        .subscribe(resp => {
          this.openAcessRulesDialog(
            resp,
            accessRulesDialog,
            userTabSet,
            selectedUsers,
          );
        });
    } else {
      this.handleDsTagLinking(accessRulesDialog, userTabSet);
    }
  }

  handleDsTagLinking(
    accessRulesDialog: TemplateRef<NbDialogModule>,
    userTabSet: boolean,
  ) {
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

  openTerritoriesDialog(accessRulesDialog, userTabSet) {
    this.team.dsTags.forEach(dsTag => {
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
    this.team.dsTags.forEach(dsTag => {
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
    this.team.dsTags.forEach(dsTag => {
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
        dialogTitle: userTabSet ? this.userTabTitle : this.dsTagTabTitle,
        isUserTab: userTabSet,
        selected: selectedElements,
      },
    });
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
    }
  }

  onClearAll(event) {
    event.update.emit([]);
  }

  getTabTitleValue(data, isUserTab: boolean) {
    if (isUserTab) {
      this.userTabTitle = data;
    } else {
      this.dsTagTabTitle = data;
    }
  }

  onClickAddAccessRules(dropdown, isUserTab) {
    if (isUserTab) {
      this.team.linkedUsers.forEach(user => {
        if (user.titleName === dropdown.placeholder) {
          user.elements = dropdown.selectedValues.map(ele => {
            return {
              id: ele.userTenantId,
              name: ele.fullName,
            };
          });
          user.selected = dropdown.selectedValues.map(ele => ele.userTenantId);
        }
      });
    } else {
      this.team.dsTags.forEach(tag => {
        if (tag.titleName === dropdown.placeholder) {
          tag.elements = dropdown.selectedValues;
          tag.selected = dropdown.selectedValues.map(ele => ele.id);
        }
      });
    }
    this.dialogRef.close();
  }

  removeListItem(data) {
    if (data.isUserTab) {
      this.team.linkedUsers.forEach(relationship => {
        if (relationship.titleName === data.tabTitle) {
          relationship.elements = relationship.elements.filter(
            user => user.id !== data.listItem.id,
          );
          relationship.selected = relationship.selected.filter(
            userId => userId !== data.listItem.id,
          );
        }
      });
    } else {
      this.team.dsTags.forEach(dsTag => {
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

  cancel(form) {
    if (this.teamId) {
      this.getTeam();
      this.invalidDsTagField = [];
      this.invalidUserField = [];
    } else {
      form.resetForm();
    }
  }
}
