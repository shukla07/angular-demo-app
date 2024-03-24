import {Component, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {UserFacadeService} from '@vmsl/shared/facades/user-facade.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {PubNubAngular} from 'pubnub-angular2';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {UserInfo} from '@vmsl/core/auth/models/user.model';
import {ToastrService} from 'ngx-toastr';
import {environment} from '@vmsl/env/environment';
import {PubnubService} from '@vmsl/shared/facades/pubnub.service';
import {UserVisibility} from '@vmsl/core/enums/user-presence.enum';
import {UserState} from '@vmsl/core/enums/user-state.eum';
import {RoleType} from '@vmsl/core/enums/roles.enum';
import {ChatFacadeService} from '../chat/shared/chat-facade.service';
import {Permission} from '@vmsl/core/auth/permission-key.enum';

@Component({
  selector: 'vmsl-address-book',
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AddressBookComponent extends RouteComponentBase {
  userFilter = {fullName: ''};
  availableCont: UserInfo[];
  unavailableCont: UserInfo[];
  favouriteUsersIds: string[];
  contacts: UserInfo[] = [];
  commonChannel: string;
  userChannel: string;
  roleType = RoleType;
  currentUser: UserInfo;
  userInFavourites: string[];
  isOnCall = false;
  call = false;
  p1 = 1;
  p2 = 1;
  stateChange = 'state-change';
  pubnubListner: object;
  permissionKey = Permission;
  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly userFacadeService: UserFacadeService,
    private readonly store: UserSessionStoreService,
    private readonly pubnub: PubNubAngular,
    private readonly router: Router,
    private readonly toastrService: ToastrService,
    private readonly pubnubService: PubnubService,
    private readonly chatFacade: ChatFacadeService,
  ) {
    super(route, location);
    this.currentUser = this.store.getUser();
    this.commonChannel = this.currentUser.tenantId;
    this.userChannel = `${this.currentUser.id}_${this.currentUser.tenantId}`;
  }

  ngOnInit() {
    super.ngOnInit();
    this.getUserFavouritesIds();
    this.getContacts();
    this.pubnubPresenceListner();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.pubnub.removeListener(this.pubnubListner);
  }

  pubnubPresenceListner() {
    this.pubnubListner = {
      message: m => {
        const data = JSON.parse(m.message);
        if (this.contacts) {
          if (data.status) {
            this.contacts.forEach(contact => {
              if (contact.userTenantId === data.userTenantId) {
                contact.userVisibility = data.status.userVisibility;
              }
            });
          }
          if (data.favourite) {
            if (data.favourite.marked) {
              this.userInFavourites.push(data.userTenantId);
            }
            if (!data.favourite.marked) {
              this.userInFavourites = this.userInFavourites.filter(
                userId => userId !== data.userTenantId,
              );
            }
          }
          this.getAvailUnavailContacts(this.contacts);
        }
      },
      presence: e => {
        this.setMyStatus(e);
        if (this.contacts) {
          this.contacts.forEach(contact => {
            if (e.uuid === contact.id) {
              if (e.action === this.stateChange) {
                this.checkIfContactIsBusy(contact, e);
              } else {
                this.checkIfContactIsOnline(contact, e);
              }
            }
            this.getAvailUnavailContacts(this.contacts);
          });
        }
      },
    };
    this.pubnub.addListener(this.pubnubListner);
  }

  checkIfContactIsBusy(contact, event) {
    switch (event.state?.status) {
      case 'Busy':
        contact.state = UserState.Online;
        contact.isOnCall = true;
        break;
      case 'Available':
        contact.state = UserState.Online;
        contact.isOnCall = false;
        break;
    }
  }

  checkIfContactIsOnline(contact, event) {
    switch (event.action) {
      case 'leave':
      case 'timeout':
        contact.state = UserState.Offline;
        break;
      case 'join':
        contact.state = UserState.Online;
        contact.isOnCall = false;
        break;
    }
  }

  setMyStatus(e) {
    if (
      e.uuid === this.store.getUser().id &&
      e.action === this.stateChange &&
      e.state?.status === 'Busy'
    ) {
      this.isOnCall = true;
    }
    if (
      e.uuid === this.store.getUser().id &&
      e.action === this.stateChange &&
      e.state?.status !== 'Busy'
    ) {
      this.isOnCall = false;
    }
  }

  getContacts() {
    this.userFacadeService.getMyContacts().subscribe(res => {
      this.contacts = res;
      this.pubnub.hereNow(
        {
          channels: [this.commonChannel, this.userChannel],
          includeState: true,
          includeUUIDs: true,
        },
        (status, response) => {
          response.channels[this.commonChannel].occupants.forEach(user => {
            this.contacts.forEach(contact => {
              if (user.uuid === contact.id) {
                if (user.state) {
                  this.checkIfContactIsBusy(contact, user);
                } else {
                  contact.state = UserState.Online;
                  contact.isOnCall = false;
                }
              }
            });
            if (
              user.uuid === this.store.getUser().id &&
              user.state?.status === 'Busy'
            ) {
              this.isOnCall = true;
            }
          });
          this.getAvailUnavailContacts(this.contacts);
        },
      );
    });
  }

  getUserFavouritesIds() {
    this.favouriteUsersIds = [];
    this.userFacadeService.getUserFavourites().subscribe(resp => {
      this.favouriteUsersIds = resp.favUsers;
      this.userInFavourites = resp.userInFav;
    });
  }

  getAvailUnavailContacts(contacts: UserInfo[]) {
    this.availableCont = [];
    this.unavailableCont = [];
    let favouriteAvailUsers = [];
    const favouriteUnAvailUsers = [];
    contacts.forEach(ele => {
      if (
        ele.state === UserState.Online &&
        ele.userVisibility === UserVisibility.Online
      ) {
        if (
          this.favouriteUsersIds &&
          this.favouriteUsersIds.includes(ele.userTenantId)
        ) {
          ele.favourite = true;
          favouriteAvailUsers.push(ele);
        } else {
          this.availableCont.push(ele);
        }
      } else if (
        ele.state === UserState.Online &&
        ele.userVisibility === UserVisibility.Incognito
      ) {
        favouriteAvailUsers = this.checkUserIncognitoArray(
          ele,
          favouriteAvailUsers,
          favouriteUnAvailUsers,
        );
      } else {
        if (
          this.favouriteUsersIds &&
          this.favouriteUsersIds.includes(ele.userTenantId)
        ) {
          ele.favourite = true;
          favouriteUnAvailUsers.push(ele);
        } else {
          this.unavailableCont.push(ele);
        }
      }
    });
    this.availableCont = favouriteAvailUsers.concat(this.availableCont);
    this.unavailableCont = favouriteUnAvailUsers.concat(this.unavailableCont);
  }

  checkUserIncognitoArray(
    ele: UserInfo,
    favouriteAvailUsers: UserInfo[],
    favouriteUnAvailUsers: UserInfo[],
  ) {
    if (
      this.favouriteUsersIds?.includes(ele.userTenantId) &&
      this.userInFavourites?.includes(ele.userTenantId)
    ) {
      ele.favourite = true;
      favouriteAvailUsers.push(ele);
    } else if (
      this.userInFavourites?.includes(ele.userTenantId) &&
      !this.favouriteUsersIds?.includes(ele.userTenantId)
    ) {
      this.availableCont.push(ele);
    } else if (
      !this.userInFavourites?.includes(ele.userTenantId) &&
      this.favouriteUsersIds?.includes(ele.userTenantId)
    ) {
      ele.favourite = true;
      favouriteUnAvailUsers.push(ele);
    } else {
      this.unavailableCont.push(ele);
    }
    return favouriteAvailUsers;
  }

  videoCall(user) {
    const timeout = 30000;
    if (this.store.getCallTab()) {
      this.toastrService.info(
        'You appear to be on a call. Please wait for 30 seconds and try again.',
        'ATTENTION',
        {
          timeOut: environment.messageTimeout,
        },
      );
    } else {
      this.store.setCallTab(true);
      setTimeout(() => {
        this.pubnubService.removeCallTabIfNotBusy();
      }, timeout);
      window.open(`/main/meeting?to=${user.id}&meetingType=video`);
    }
  }

  audioCall(user) {
    const timeout = 30000;
    if (this.store.getCallTab()) {
      this.toastrService.info(
        'You appear to be on a call. Please wait for 30 seconds and try again.',
        'ATTENTION',
        {
          timeOut: environment.messageTimeout,
        },
      );
    } else {
      this.store.setCallTab(true);
      setTimeout(() => {
        this.pubnubService.removeCallTabIfNotBusy();
      }, timeout);
      window.open(`/main/meeting?to=${user.id}&meetingType=audio`);
    }
  }

  openProfile(user) {
    this.router.navigate([`/main/profile/${user.id}`]);
  }

  openCalendar(user) {
    this.router.navigate([`/main/calendar/${user.id}`]);
  }

  markFavourite(user) {
    this._subscriptions.push(
      this.userFacadeService
        .markUserFavourite(user.userTenantId)
        .subscribe(resp => {
          this.refreshData(resp);
        }),
    );
  }

  unMarkFavourite(user) {
    this._subscriptions.push(
      this.userFacadeService
        .unMarkUserFavourite(user.userTenantId)
        .subscribe(resp => {
          this.refreshData(resp);
        }),
    );
  }

  refreshData(data) {
    if (data['success']) {
      this.getUserFavouritesIds();
      this.getContacts();
    }
  }

  openComposeMail(user) {
    this.router.navigate(['/main/mailbox/compose-email'], {
      queryParams: {to: user.id},
    });
  }

  chat(user) {
    this.chatFacade.setChatId(user);
  }
}
