import {
  Component,
  ViewEncapsulation,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteComponentBase } from '@vmsl/core/route-component-base';
import { Location } from '@angular/common';
import { UserFacadeService } from '../../shared/facades/user-facade.service';
import { UserSessionStoreService } from '@vmsl/core/store/user-session-store.service';
import { Permission } from '@vmsl/core/auth/permission-key.enum';
import { NbDialogService, NbDialogModule, NbDialogRef } from '@nebular/theme';
import {
  AccessRulesAssociation,
  DsFlags,
  UserInfo,
} from '@vmsl/core/auth/models/user.model';
import { ToastrService } from 'ngx-toastr';
import { environment } from '@vmsl/env/environment';
import { MsalService } from '@azure/msal-angular';
import { AzureMsalFacadeService } from '@vmsl/shared/facades/azure-msal-facade.service';
import { InteractionRequiredAuthError } from 'msal';
import { timezones } from '../../../assets/array/timezones';
import { RoleType } from '@vmsl/core/enums';
import { DiseaseAreasService } from '@vmsl/shared/facades/disease-areas.service';
import { TerritoryManagementService } from '@vmsl/shared/facades/territory-management.service';
import { TherapeuticAreasService } from '@vmsl/shared/facades/therapeutic-areas.service';
import { ProfileAccessRulesComponent } from '@vmsl/shared/components/profile-access-rules/profile-access-rules.component';
import { DiseaseArea } from '../disease-areas/shared/models/disease-area-info.model';
import { Territory } from '../territories-management/shared/models/territory-info.model';
import { TherapeuticArea } from '../therapeutic-areas-management/shared/models/therapeutic-area-info.model.ts';
import { NgModel } from '@angular/forms';
import { DivisionStates } from '@vmsl/core/enums/division-states.enum';
import { ProfileFacadeService } from './shared/profile-facade.service';
import { PubNubAngular } from 'pubnub-angular2';
import { Status } from '@vmsl/core/enums/status.enum';
import { Subject } from 'rxjs';

@Component({
  selector: 'vmsl-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProfileComponent extends RouteComponentBase {
  @ViewChild('dialog', { read: TemplateRef }) dialog: TemplateRef<NbDialogModule>;
  @ViewChild('removeListItemDialog', { read: TemplateRef })
  removeListItemDialog: TemplateRef<NbDialogModule>;
  @ViewChild('dsTags', { static: false }) dsTags: ProfileAccessRulesComponent;
  @ViewChild('registerHcpDialog', { static: false })
  registerHcpDialog: TemplateRef<NbDialogModule>;
  userId: string;
  user: UserInfo;
  currentUser = false;
  permissionKey = Permission;
  profile: File;
  dialogRef: NbDialogRef<NbDialogModule>;
  removeListItemDialogRef: NbDialogRef<NbDialogModule>;
  registerHcpDialogRef: NbDialogRef<NbDialogModule>;
  uploadingPicture = false;
  deletePhoto = false;
  qrData: string;
  hideAssignedUsers = false;
  syncButtonName: string;
  permissions: string[];
  isCalendarSync: boolean;
  address: string[];
  userTimeZone: string;
  roleType = RoleType;
  dsFlag = DsFlags;
  userTabTitle: string;
  dsTagTabTitle: string;
  territories: Territory[];
  therapeuticAreas: TherapeuticArea[];
  diseaseAreas: DiseaseArea[];
  orgsToSwitch: Object[];
  orgsToRegister: Object[];
  orgIdToRegister: string = null;
  _calSyncingSubject: Subject<Object> = new Subject<Object>();
  isCalSyncing = false;
  constructor(
    protected route: ActivatedRoute,
    protected location: Location,
    private readonly router: Router,
    private readonly userService: UserFacadeService,
    private readonly dialogService: NbDialogService,
    private readonly toastrService: ToastrService,
    private readonly mslaAuthService: MsalService,
    private readonly msalService: AzureMsalFacadeService,
    private readonly profileService: ProfileFacadeService,
    private readonly territoryService: TerritoryManagementService,
    private readonly therapeuticAreaService: TherapeuticAreasService,
    private readonly diseasAreaService: DiseaseAreasService,
    private readonly pubnub: PubNubAngular,
    readonly store: UserSessionStoreService,
  ) {
    super(route, location);
    this.isCalSyncing = this.store.getIsCalSyncing();
    const oneSecond = 1000;
    if (this.isCalSyncing) {
      const interval = setInterval(() => {
        if (this.store.getIsCalSyncing()) {
          clearInterval(interval);
          this.isCalSyncing = false;
          this.store.setCalSync(true);
          this.checkSyncStatus();
        }
      }, oneSecond);
    }
    this.userId = this.getRouteParam('id') || this.store.getUser().id;
    if (this.store.getUser().id === this.userId) {
      this.currentUser = true;
    }
    this.permissions = this.store.getUser().permissions;
  }

  ngOnInit(): void {
    this.getUserProfile();
    if (this.store.getUser().permissions.includes(Permission.canSwitchOrg)) {
      this.getAllOrganisations();
      this.pubnub.addListener({
        presence: e => {
          if (
            e.uuid === this.store.getUser().id &&
            e.action === 'state-change'
          ) {
            if (e.state?.status === 'Busy') {
              this.user.isOnCall = true;
            } else {
              this.user.isOnCall = false;
            }
          }
        },
      });
    }
  }

  getAllOrganisations() {
    this.profileService.getOrgToSwitch().subscribe(res => {
      this.orgsToSwitch = res;
    });
  }

  changeOrg(tenant) {
    this.profileService.switchOrg(tenant.tenantId).subscribe(response => {
      this.pubnub.unsubscribeAll();
      this.store.saveAccessToken(response['accessToken']);
      this.store.saveRefreshToken(response['refreshToken']);
      this.store.setPubnubSubsKey(response['subscriptionKey']);
      window.location.reload();
    });
  }

  registerInOrg() {
    this.registerHcpDialogRef = this.dialogService.open(this.registerHcpDialog);
    this.profileService.getOrgsForHcpRegister().subscribe(res => {
      this.orgsToRegister = res;
    });
  }

  registerHcpInOrg() {
    this.user.dsFlag = DsFlags.AssociationOnly;
    this.user.tenantId = this.orgIdToRegister;
    this.user.status = Status.inactive;
    this.profileService.registerHCP(this.user).subscribe(res => {
      this.toastrService.success('', 'Registration Complete', {
        timeOut: environment.messageTimeout,
      });
      this.registerHcpDialogRef.close();
      this.getAllOrganisations();
    });
  }

  getUserProfile() {
    if (this.userId) {
      this.user = null;
      this.store.deleteCalSync();
      this._subscriptions.push(
        this.userService.getUserById(this.userId).subscribe(resp => {
          this.user = resp;
          this.setUserTimeZone();
          this.store.setCalSync(this.user.isCalSync);
          this.address = this.getUserAddress(this.user);
          this.qrData = `${window.location.origin}/hcp/register?referCode=${this.user.referralCode}`;
          if (
            this.user.roleType === this.roleType.Administrator ||
            this.user.roleType === this.roleType.jrHcp
          ) {
            this.hideAssignedUsers = true;
          }
          if (this.permissions.includes('SyncCalendar')) {
            this.checkSyncStatus();
          }
          this.pubnub.getState(
            {
              uuid: this.store.getUser().id,
              channels: [this.store.getUser().tenantId],
            },
            (status, response) => {
              if (
                response.channels[this.store.getUser().tenantId]?.status ===
                'Busy'
              ) {
                this.user.isOnCall = true;
              }
            },
          );
        }),
      );
    }
  }

  getUserAddress(userInfo) {
    const addressArr = [];
    userInfo.addressLine1 && addressArr.push(` ${userInfo.addressLine1}`);
    userInfo.addressLine2 && addressArr.push(` ${userInfo.addressLine2}`);
    userInfo.city && addressArr.push(` ${userInfo.city}`);
    userInfo.state && addressArr.push(` ${userInfo.state}`);
    userInfo.zip && addressArr.push(` ${userInfo.zip}`);
    return addressArr;
  }

  setUserTimeZone() {
    timezones.forEach(timezone => {
      if (this.user.timeZone.includes(timezone.momentValue)) {
        this.userTimeZone = timezone.label;
      }
    });
  }

  allocateDsTags() {
    this.user.dsTags.forEach(dsTag => {
      if (dsTag.associatedTo === AccessRulesAssociation.all) {
        dsTag.selected = [];
        dsTag.elements = [];
      }
    });
  }

  editProfile(id?: string) {
    if (id && !this.currentUser) {
      this.router.navigate([`/main/user/edit/${id}`]);
    } else {
      this.router.navigate([`/main/user/edit`]);
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

  onSelect(event) {
    const maxSize = 2000000;
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
    } else {
      this.profile = event.addedFiles;
    }
  }

  onRemove() {
    this.profile = null;
  }

  updateProfile() {
    this.uploadingPicture = true;
    const formData = new FormData();
    formData.append('file', this.profile[0]);
    this._subscriptions.push(
      this.userService.uploadProfile(formData).subscribe(
        res => {
          this.user.photoKey = res['imageKey'];
          this.editProfileForPhoto();
        },
        err => {
          this.onRemove();
          this.uploadingPicture = false;
          this.dialogRef.close();
          this.toastrService.error('Invalid file type.', 'ERROR', {
            timeOut: environment.messageTimeout,
          });
        },
      ),
    );
  }

  editProfileForPhoto() {
    this.userService.editUser(this.user, this.userId).subscribe(
      () => {
        this.onRemove();
        this.dialogRef.close();
        window.location.reload();
      },
      err => (this.uploadingPicture = false),
    );
  }

  openPhotoDialog(dialog: TemplateRef<NbDialogModule>) {
    if (this.currentUser || this.store.getUser().role === '4') {
      this.dialogRef = this.dialogService.open(dialog, {
        closeOnBackdropClick: false,
        closeOnEsc: false,
      });
    } else {
      return;
    }
  }

  openRemoveListItemDialog(data, isUserTab) {
    if (!isUserTab) {
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

  searchResults(
    accessRulesDialog: TemplateRef<NbDialogModule>,
    userTabSet: boolean,
  ) {
    if (userTabSet) {
      var selectedUsers = [];
      this.user.relationships.forEach(user => {
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

  editUser() {
    this.allocateDsTags();
    this._subscriptions.push(
      this.userService.editUser(this.user, this.userId).subscribe(resp => {
        this.toastrService.success('User updated successfully.', 'SUCCESS ', {
          timeOut: environment.messageTimeout,
        });
        this.getUserProfile();
      }),
    );
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
      if (!dropdown.selectedValues.length) {
        this.toastrService.error(
          `Atleast one ${dropdown.placeholder} should be assigned to the user.`,
          'ATTENTIION',
          {
            timeOut: environment.messageTimeout,
          },
        );
      } else {
        this.user.dsTags.forEach(tag => {
          if (tag.titleName === dropdown.placeholder) {
            tag.elements = dropdown.selectedValues;
            tag.selected = dropdown.selectedValues.map(ele => ele.id);
          }
        });
        this.editUser();
        this.dialogRef.close();
      }
    }
  }

  removeListItem(isUserTab, listItem, tabTitle) {
    if (isUserTab) {
      this.user.relationships.forEach(relationship => {
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
      this.user.dsTags.forEach(dsTag => {
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
    this.editUser();
    this.removeListItemDialogRef.close();
  }

  copyReferInfo() {
    const selBox1 = document.createElement('textarea');
    selBox1.style.position = 'fixed';
    selBox1.style.left = '0';
    selBox1.style.top = '0';
    selBox1.style.opacity = '0';
    selBox1.value = this.qrData;
    document.body.appendChild(selBox1);
    selBox1.focus();
    selBox1.select();
    if (document.execCommand('copy')) {
      this.toastrService.success('Referral URL copied on clipboard', null, {
        timeOut: environment.messageTimeout,
      });
    }
    document.body.removeChild(selBox1);
  }

  deleteProfile() {
    this.user.photoKey = '';
    this.editProfileForPhoto();
  }

  onSyncClick() {
    if (this.isCalendarSync) {
      this.outlookCalendarDesync();
    } else {
      this.outLookCalendarSync();
    }
  }

  checkSyncStatus() {
    this.isCalendarSync = this.store.getCalSync();
    if (this.isCalendarSync) {
      this.syncButtonName = 'Disconnect Calendar with Outlook';
    } else {
      this.syncButtonName = 'Connect Calendar with Outlook';
    }
  }

  outLookCalendarSync() {
    const isIE =
      window.navigator.userAgent.indexOf('MSIE ') > -1 ||
      window.navigator.userAgent.indexOf('Trident/') > -1;

    if (isIE) {
      this.mslaAuthService.loginRedirect({
        extraScopesToConsent: ['user.read', 'openid', 'profile'],
      });
    } else {
      this.mslaAuthService.loginPopup({
        extraScopesToConsent: ['user.read', 'openid', 'profile'],
      });

      const requestObj = {
        scopes: ['user.read'],
      };

      this.mslaAuthService
        .acquireTokenSilent(requestObj)
        .then(tokenResponse => {
          // Callback code here
          this.onCalendarSyncCallback(tokenResponse.idToken.rawIdToken);
        })
        .catch(error => {
          const syncRequestTimeLimit = 2000;
          const syncRequestInterval = window.setInterval(() => {
            for (const key in localStorage) {
              if (
                key ===
                `msal.${this.store.getCalTenantConfig().authClientId}.idtoken`
              ) {
                clearInterval(syncRequestInterval);
                this.onCalendarSyncCallback(localStorage.getItem(key));
              }
            }
          }, syncRequestTimeLimit);
          if (error instanceof InteractionRequiredAuthError) {
            this.mslaAuthService.loginPopup(requestObj);
          }
        });
    }
  }

  outlookCalendarDesync() {
    this._subscriptions.push(
      this.msalService.calendarDesyncCallback().subscribe(
        resp => {
          if (resp['success']) {
            this.isCalendarSync = true;
            this.toastrService.success(
              'Calendar disconnected successfully with Outlook account',
              'SUCCESS',
              {
                timeOut: environment.messageTimeout,
              },
            );
            this.store.setCalSync(false);
            this.checkSyncStatus();
          }
        },
        err => {
          this.isCalendarSync = false;
          this.store.setCalSync(false);
          this.checkSyncStatus();
        },
      ),
    );
  }

  onCalendarSyncCallback(idToken) {
    this._calSyncingSubject.subscribe({
      complete: () => {
        this._calSyncingSubject = new Subject<Object>();
        this.store.setIsCalSyncing(false);
        this.isCalSyncing = false;
      },
      next: response => {
        if (response['success']) {
          localStorage.removeItem(
            `msal.${this.store.getCalTenantConfig().authClientId}.idtoken`,
          );
          this.isCalendarSync = true;
          this.toastrService.success(
            'Calendar connected successfully with Outlook account',
            'SUCCESS',
            {
              timeOut: environment.messageTimeout,
            },
          );
          this.store.setCalSync(true);
          this.checkSyncStatus();
        }
      },
      error: err => {
        this.isCalSyncing = false;
        this.store.setIsCalSyncing(false);
      },
    });
    if (this._calSyncingSubject.observers.length === 1) {
      this.store.setIsCalSyncing(true);
      this.isCalSyncing = true;
      this.toastrService.success(
        'Do not logout or refresh the page while the calendar is syncing. Events might take time to reflect over the calendar.',
        'Calendar sync is in process',
        {
          timeOut: environment.messageTimeout,
        },
      );
      this.msalService
        .calendarSyncCallback(idToken)
        .subscribe(this._calSyncingSubject);
    }
    return this._calSyncingSubject;
  }

  getTabTitleValue(data, isUserTab: boolean) {
    if (isUserTab) {
      this.userTabTitle = data;
    } else {
      this.dsTagTabTitle = data;
    }
  }
}
