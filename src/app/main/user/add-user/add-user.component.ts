import {
  Component,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteComponentBase } from '@vmsl/core/route-component-base';
import { Location } from '@angular/common';
import { NgForm, NgModel } from '@angular/forms';
import { UserFacadeService } from '../../../shared/facades/user-facade.service';
import { SystemStoreFacadeService } from '@vmsl/core/store/system-store-facade.service';
import { Role } from '@vmsl/core/store/models';
import { ToastrService } from 'ngx-toastr';
import { environment } from '@vmsl/env/environment';
import { UserSessionStoreService } from '@vmsl/core/store/user-session-store.service';
import { AuthService } from '@vmsl/core/auth/auth.service';
import {
  UserInfo,
  DsFlags,
  AccessRules,
  AccessRulesAssociation,
} from '@vmsl/core/auth/models/user.model';
import { RoleName, RoleType } from '@vmsl/core/enums/roles.enum';
import countryData from '../../../../assets/json/countries-states';
import { TherapeuticAreasService } from '@vmsl/shared/facades/therapeutic-areas.service';
import { DiseaseAreasService } from '@vmsl/shared/facades/disease-areas.service';
import { TerritoryManagementService } from '@vmsl/shared/facades/territory-management.service';
import { NbDialogModule, NbDialogRef, NbDialogService } from '@nebular/theme';
import { Permission } from '@vmsl/core/auth/permission-key.enum';
import { ProfileAccessRulesComponent } from '@vmsl/shared/components/profile-access-rules/profile-access-rules.component';
import { Territory } from '../../territories-management/shared/models/territory-info.model';
import { TherapeuticArea } from '../../therapeutic-areas-management/shared/models/therapeutic-area-info.model.ts';
import { DiseaseArea } from '../../disease-areas/shared/models/disease-area-info.model';
import { DivisionStates } from '@vmsl/core/enums/division-states.enum';
import { timezones } from '../../../../assets/array/timezones';

@Component({
  selector: 'vmsl-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AddUserComponent extends RouteComponentBase {
  title = 'Add User';
  user = new UserInfo();
  roles: Role[];
  userId: string;
  userRoute = '/main/user';
  currentUser = false;
  profileData: File;
  loadingPicture = false;
  roleType = RoleType;
  roleTypeId: number;
  userPermissions: string[];
  permissionKey = Permission;
  countryData = countryData.countries;
  statesByCountry: { state: string }[];
  zipPattern = '^[0-9]{5}(?:-[0-9]{4})?$';
  timeZoneList = timezones;
  dsFlag = DsFlags;
  dialogRef: NbDialogRef<NbDialogModule>;
  removeListItemDialogRef: NbDialogRef<NbDialogModule>;
  userTabTitle: string;
  dsTagTabTitle: string;
  @ViewChild('removeListItemDialog', { read: TemplateRef })
  removeListItemDialog: TemplateRef<NbDialogModule>;
  @ViewChild('dsTags', { static: false })
  dsTagsDialog: ProfileAccessRulesComponent;
  invalidDsTagField = [];
  territories: Territory[];
  therapeuticAreas: TherapeuticArea[];
  diseaseAreas: DiseaseArea[];
  jobTitles: Object[];

  constructor(
    protected route: ActivatedRoute,
    protected location: Location,
    private readonly router: Router,
    private readonly userFacadeService: UserFacadeService,
    private readonly systemStore: SystemStoreFacadeService,
    private readonly toastrService: ToastrService,
    private readonly store: UserSessionStoreService,
    private readonly authService: AuthService,
    private readonly territoryService: TerritoryManagementService,
    private readonly therapeuticAreaService: TherapeuticAreasService,
    private readonly diseasAreaService: DiseaseAreasService,
    private readonly dialogService: NbDialogService,
  ) {
    super(route, location);
  }

  ngOnInit() {
    this.userPermissions = this.store.getUser().permissions;
    if (this.router.url.includes('edit')) {
      this.userId = this.getRouteParam('id') || this.store.getUser().id;
    }
    if (this.userId) {
      this.title = 'Update User';
      this.getUser();
    } else {
      this.getRoles();
      this.getJobTitles();
      // Set default country to United States
      const { country } = countryData.countries.find(
        conuntryDetail => conuntryDetail.country === 'United States',
      );
      this.getStatesByCountry(country, false);
      this.user.country = country;
    }
    if (this.store.getUser().id === this.userId) {
      this.currentUser = true;
    }
  }

  getRoles() {
    this.systemStore.getRoles().subscribe(roles => {
      this.roles = roles;
    });
  }

  getJobTitles() {
    this._subscriptions.push(
      this.userFacadeService.getJobTitles().subscribe(resp => {
        this.jobTitles = resp;
      }),
    );
  }

  getStatesByCountry(countryText, userPageLoaded) {
    if (!countryText) {
      let allStates = [];
      this.countryData.forEach(country => {
        allStates = allStates.concat(
          country.states.map(state => {
            return {
              state,
            };
          }),
        );
      });
      // null requirement is necessary so that the placeholder doesn't go up if no item is selected
      this.user.country = null;
      this.statesByCountry = allStates;
    } else {
      if (countryText === 'United States') {
        this.zipPattern = '^[0-9]{5}(?:-[0-9]{4})?$';
      } else {
        this.zipPattern = '^.{1,10}$';
      }
      const [countryDetails] = this.countryData.filter(
        countryDetail => countryDetail.country === countryText,
      );
      this.statesByCountry = countryDetails.states.map(state => {
        return {
          state: state,
        };
      });
    }
    // null requirement is necessary so that the placeholder doesn't go up if no item is selected
    if (!userPageLoaded || !this.user.state) {
      this.user.state = null;
    }
  }

  addUpdateUser(form: NgForm) {
    if (form.form.controls['phone'].errors) {
      form.form.controls['phone'].markAsTouched();
    }
    if (form.invalid) {
      return;
    }
    if (this.user.dsFlag === this.dsFlag.Both && this.dsTagsDialog) {
      if (!this.checkMendatoryFields(this.dsTagsDialog.accessRules)) {
        return;
      }
    }
    if (!this.currentUser) {
      this.allocateDsTags();
    }
    if (this.userId) {
      this.userFacadeService.editUser(this.user, this.userId).subscribe(res => {
        this.toastrService.success('User updated successfully.', 'SUCCESS ', {
          timeOut: environment.messageTimeout,
        });
        if (this.currentUser) {
          this.authService.refreshToken().subscribe(() => {
            this.authService.currentUser().subscribe();
            window.location.href = `/main/myProfile`;
          });
        } else {
          this.router.navigate([this.userRoute]);
        }
      });
    } else {
      this.userFacadeService.addUser(this.user).subscribe(res => {
        this.toastrService.success('User added successfully.', 'SUCCESS ', {
          timeOut: environment.messageTimeout,
        });
        this.router.navigate([this.userRoute]);
      });
    }
  }

  checkMendatoryFields(accessRules: AccessRules[]) {
    var formValid = true;
    accessRules.forEach(accessRule => {
      if (
        accessRule.associatedTo === AccessRulesAssociation.some &&
        accessRule.selected
      ) {
        if (!accessRule.selected.length) {
          this.invalidDsTagField.push(` ${accessRule.titleName}`);
          formValid = false;
        }
      }
    });
    return formValid;
  }

  getUser() {
    this.userFacadeService.getUserById(this.userId).subscribe(
      res => {
        this.onRoleChange(res.role);
        this.user = res;
        if (this.user.permissions.includes('HasJobTitle')) {
          this.getJobTitles();
        }
        // fetch the states dropdown depending upon country
        this.getStatesByCountry(this.user.country, true);
        // select the state form the dropdown for existing user
        this.getRoles();
      },
      err => {
        const goBackDelay = 2000;
        setTimeout(function () {
          window.location.href = '/main/user';
        }, goBackDelay);
      },
    );
  }

  onRoleChange(data) {
    this.systemStore.getRoles().subscribe(role => {
      role.forEach(roles => {
        if (roles.id === data?.value || roles.id === data) {
          this.roleTypeId = roles.roleType;
          this.user.roleName = roles.name;
          this.user.roleType = roles.roleType;
        }
      });
    });
    this.associationOnRoleChange();
  }

  associationOnRoleChange() {
    this.user.relationships = [];
    const director = new AccessRules(
      RoleName.director,
      AccessRulesAssociation.na,
    );
    const mml = new AccessRules(RoleName.superMSL, AccessRulesAssociation.na);
    const ml = new AccessRules(RoleName.msl, AccessRulesAssociation.na);
    const hcp = new AccessRules(RoleName.hcp, AccessRulesAssociation.na);

    switch (this.user.roleName) {
      case RoleName.director:
        this.user.relationships.push(director, mml, ml, hcp);
        break;
      case RoleName.superMSL:
        this.user.relationships.push(director, mml, ml, hcp);
        break;
      case RoleName.msl:
        this.user.relationships.push(director, mml, ml, hcp);
        break;
      case RoleName.hcp:
        this.user.relationships.push(director, mml, ml);
        break;
    }
  }

  onPictureUpload(event) {
    const maxSize = 2000000;
    this.loadingPicture = true;
    if (event.rejectedFiles && event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].size > maxSize) {
        this.toastrService.warning(
          'Maximum file size allowed is 2 MB.',
          'Exceeding file size',
          {
            timeOut: environment.messageTimeout,
          },
        );
      } else {
        this.toastrService.warning(
          'You can only import an image.',
          'Invalid file type.',
          {
            timeOut: environment.messageTimeout,
          },
        );
      }
      this.loadingPicture = false;
    } else {
      this.profileData = event.addedFiles;
      const formData = new FormData();
      formData.append('file', this.profileData[0]);
      this._subscriptions.push(
        this.userFacadeService.uploadProfile(formData).subscribe(
          res => {
            this.loadingPicture = false;
            this.user.photoKey = res['imageKey'];
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

  searchResults(
    accessRulesDialog: TemplateRef<NbDialogModule>,
    userTabSet: boolean,
  ) {
    if (userTabSet) {
      let selectedUsers = [];
      this.user.relationships.forEach(user => {
        if (user.titleName === this.userTabTitle) {
          selectedUsers = user.selected;
        }
      });
      this.userFacadeService
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

  allocateDsTags() {
    this.user.dsTags.forEach(dsTag => {
      if (dsTag.associatedTo === AccessRulesAssociation.all) {
        dsTag.selected = [];
        dsTag.elements = [];
      }
    });
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
    this.user.dsTags.forEach(dsTag => {
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
    this.user.dsTags.forEach(dsTag => {
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
    this.user.dsTags.forEach(dsTag => {
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
    if (this.userId) {
      var index = data.findIndex(o => o.id === this.userId);
      if (index !== -1) {
        data.splice(index, 1);
      }
    }
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
    if (isUserTab) {
      this.user.relationships.forEach(user => {
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
      this.user.dsTags.forEach(tag => {
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
      this.user.relationships.forEach(relationship => {
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
      this.user.dsTags.forEach(dsTag => {
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
    }
  }

  onClearAll(event) {
    event.update.emit([]);
  }

  onRemove() {
    this.profileData = null;
  }

  cancel(form: NgForm, phoneField) {
    if (this.userId) {
      this.getUser();
    } else {
      phoneField.phoneNumber = '';
      form.resetForm();
      form.controls['timeZone'].setValue('America/New_York');
      this.profileData = null;
    }
  }

  ngAfterViewInit() {
    const phoneButton = document.querySelector(
      '.phone-no button.country-selector',
    );
    phoneButton['disabled'] = this.userId ? true : false;
  }
}
