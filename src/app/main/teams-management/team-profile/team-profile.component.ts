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
import {TeamInfo} from '../shared/models/team-info.model';
import {TeamsManagementService} from '../shared/teams-management.service';
import {timezones} from '../../../../assets/array/timezones';
import {
  AccessRulesAssociation,
  DsFlags,
} from '@vmsl/core/auth/models/user.model';
import {NbDialogService, NbDialogModule, NbDialogRef} from '@nebular/theme';
import {UserFacadeService} from '@vmsl/shared/facades/user-facade.service';
import {TerritoryManagementService} from '@vmsl/shared/facades/territory-management.service';
import {TherapeuticAreasService} from '@vmsl/shared/facades/therapeutic-areas.service';
import {DiseaseAreasService} from '@vmsl/shared/facades/disease-areas.service';
import {environment} from '@vmsl/env/environment';
import {ToastrService} from 'ngx-toastr';
import {ProfileAccessRulesComponent} from '@vmsl/shared/components/profile-access-rules/profile-access-rules.component';
import {DiseaseArea} from '../../disease-areas/shared/models/disease-area-info.model';
import {Territory} from '../../territories-management/shared/models/territory-info.model';
import {TherapeuticArea} from '../../therapeutic-areas-management/shared/models/therapeutic-area-info.model.ts';
import {NgModel} from '@angular/forms';
import {DivisionStates} from '@vmsl/core/enums/division-states.enum';

@Component({
  selector: 'vsml-teams',
  templateUrl: './team-profile.component.html',
  styleUrls: ['./team-profile.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TeamProfileComponent extends RouteComponentBase {
  @ViewChild('dialog', {read: TemplateRef}) dialog: TemplateRef<NbDialogModule>;
  removeListItemDialogRef: NbDialogRef<NbDialogModule>;
  @ViewChild('removeListItemDialog', {read: TemplateRef})
  removeListItemDialog: TemplateRef<NbDialogModule>;
  @ViewChild('dsTags', {static: false}) dsTags: ProfileAccessRulesComponent;
  @ViewChild('linkedUsers', {static: false})
  linkedUsers: ProfileAccessRulesComponent;
  teamId: string;
  team: TeamInfo;
  teamTimeZone = '(GMT-04:00) Eastern Time - New York';
  dsFlag = DsFlags;
  dialogRef: NbDialogRef<NbDialogModule>;
  userTabTitle: string;
  dsTagTabTitle: string;
  territories: Territory[];
  therapeuticAreas: TherapeuticArea[];
  diseaseAreas: DiseaseArea[];

  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly router: Router,
    protected readonly storeService: UserSessionStoreService,
    private readonly teamsService: TeamsManagementService,
    private readonly dialogService: NbDialogService,
    private readonly userService: UserFacadeService,
    private readonly territoryService: TerritoryManagementService,
    private readonly therapeuticAreaService: TherapeuticAreasService,
    private readonly diseasAreaService: DiseaseAreasService,
    private readonly toastrService: ToastrService,
  ) {
    super(route, location);
    this.teamId = this.getRouteParam('id');
  }

  ngOnInit(): void {
    this.getTeamProfile();
  }

  getTeamProfile() {
    this._subscriptions.push(
      this.teamsService.getTeamById(this.teamId).subscribe(resp => {
        if (resp) {
          this.team = resp;
          this.setTeamTimeZone();
        }
      }),
    );
  }

  editProfile() {
    this.router.navigate([`/main/teams-management/edit/${this.teamId}`]);
  }

  allocateDsTags() {
    this.team.dsTags.forEach(dsTag => {
      if (dsTag.associatedTo === AccessRulesAssociation.all) {
        dsTag.selected = [];
        dsTag.elements = [];
      }
    });
  }

  getTerritories() {
    this._subscriptions.push(
      this.territoryService.getTerritoriesFiltered().subscribe(resp => {
        this.territories = resp.filter(territory => territory.status);
      }),
    );
  }

  getTherapeuticAreas() {
    this._subscriptions.push(
      this.therapeuticAreaService
        .getTherapeuticAreasFiltered()
        .subscribe(resp => {
          this.therapeuticAreas = resp.filter(
            therapeuticArea => therapeuticArea.status,
          );
        }),
    );
  }

  getDiseaseAreas() {
    this._subscriptions.push(
      this.diseasAreaService.getDiseaseAreasFiltered().subscribe(resp => {
        this.diseaseAreas = resp.filter(diseaseAreas => diseaseAreas.status);
      }),
    );
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

  getNames(data: string[]) {
    const capitalizeDays = [];
    if (data) {
      data.forEach(day => {
        capitalizeDays.push(
          ` ${day[0].toUpperCase() + day.substr(1).toLowerCase()}`,
        );
      });
    }
    return capitalizeDays;
  }

  setTeamTimeZone() {
    timezones.forEach(timezone => {
      if (this.team.timeZone.includes(timezone.momentValue)) {
        this.teamTimeZone = timezone.label;
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

  getTabTitleValue(data, isUserTab: boolean) {
    if (isUserTab) {
      this.userTabTitle = data;
    } else {
      this.dsTagTabTitle = data;
    }
  }

  onClickAddAccessRules(dropdown, isUserTab) {
    if (!dropdown.selectedValues.length) {
      this.toastrService.error(
        `Atleast one ${dropdown.placeholder} should be assigned to the user.`,
        'ATTENTIION',
        {
          timeOut: environment.messageTimeout,
        },
      );
    } else {
      if (isUserTab) {
        this.team.linkedUsers.forEach(user => {
          if (user.titleName === dropdown.placeholder) {
            user.elements = dropdown.selectedValues.map(ele => {
              return {
                id: ele.userTenantId,
                name: ele.fullName,
              };
            });
            user.selected = dropdown.selectedValues.map(
              ele => ele.userTenantId,
            );
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
      this.editTeam();
      this.dialogRef.close();
    }
  }

  editTeam() {
    this.allocateDsTags();
    this._subscriptions.push(
      this.teamsService.editTeam(this.team, this.teamId).subscribe(resp => {
        this.toastrService.success('Team Updated succesfully', 'SUCCESS ', {
          timeOut: environment.messageTimeout,
        });
      }),
    );
  }

  removeListItem(isUserTab, listItem, tabTitle) {
    if (isUserTab) {
      this.team.linkedUsers.forEach(relationship => {
        if (relationship.titleName === tabTitle) {
          relationship.elements = relationship.elements.filter(
            user => user.id !== listItem.id,
          );
          relationship.selected = relationship.selected.filter(
            userId => userId !== listItem.id,
          );
        }
      });
    } else {
      this.team.dsTags.forEach(dsTag => {
        if (dsTag.titleName === tabTitle) {
          dsTag.elements = dsTag.elements.filter(
            user => user.id !== listItem.id,
          );
          dsTag.selected = dsTag.selected.filter(
            userId => userId !== listItem.id,
          );
        }
      });
    }
    this.editTeam();
    this.removeListItemDialogRef.close();
  }

  removeUserListItemDialog(data) {
    this.linkedUsers.accessRules.forEach(accessRule => {
      if (this.userTabTitle === accessRule.titleName) {
        if (accessRule.selected.length === 1) {
          this.toastrService.warning(
            `Atleast one ${this.userTabTitle} should be assigned to the user.`,
            'ATTENTIION',
            {
              timeOut: environment.messageTimeout,
            },
          );
        } else {
          this.removeListItemDialogRef = this.dialogService.open(
            this.removeListItemDialog,
            {
              closeOnBackdropClick: false,
              closeOnEsc: false,
              context: data,
            },
          );
        }
      }
    });
  }

  removeDsTagsListItemDialog(data) {
    this.dsTags.accessRules.forEach(accessRule => {
      if (this.dsTagTabTitle === accessRule.titleName) {
        if (accessRule.selected.length === 1) {
          this.toastrService.warning(
            `Atleast one ${this.dsTagTabTitle} should be assigned to the user.`,
            'ATTENTIION',
            {
              timeOut: environment.messageTimeout,
            },
          );
        } else {
          this.removeListItemDialogRef = this.dialogService.open(
            this.removeListItemDialog,
            {
              closeOnBackdropClick: false,
              closeOnEsc: false,
              context: data,
            },
          );
        }
      }
    });
  }
}
