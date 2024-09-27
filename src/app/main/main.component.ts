import { Component, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { RouteComponentBase } from '../core/route-component-base';
import {
  ActivatedRoute,
  Router,
  RouterEvent,
  NavigationStart,
} from '@angular/router';
import { Location } from '@angular/common';
import { menuItem } from './pages-menu';
import {
  NbMenuItem,
  NbDialogService,
  NbMenuService,
  NbMediaBreakpointsService,
  NbSidebarService,
  NbDialogModule,
  NbDialogRef,
  NbIconLibraries,
} from '@nebular/theme';
import { UserSessionStoreService } from '@vmsl/core/store/user-session-store.service';
import { PubNubAngular } from 'pubnub-angular2';
import { NgxPermissionsObject, NgxPermissionsService } from 'ngx-permissions';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import * as lodash from 'lodash';
import { AuthService } from '@vmsl/core/auth/auth.service';
import { forkJoin, ReplaySubject } from 'rxjs';
import { UserFacadeService } from '@vmsl/shared/facades/user-facade.service';
import { UserInfo } from '@vmsl/core/auth/models/user.model';
import { OpentokService } from './audio-video/shared/opentok.service';
import { TeamsFacadeService } from '@vmsl/shared/facades/teams-facade.service';
import { TeamInfo } from './teams-management/shared/models/team-info.model';
import { ToastrService } from 'ngx-toastr';
import { environment } from '@vmsl/env/environment';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { AzureMsalFacadeService } from '@vmsl/shared/facades/azure-msal-facade.service';
import { icons } from './main-custom-icons';
import { MaLinkComponent } from './ma/ma-link/ma-link.component';
import { MALink } from './ma/ma-link/ma-link.model';
import { MaCallingService } from './ma/shared/ma-calling.service';
import { ChatFacadeService } from './chat/shared/chat-facade.service';
import { Chat } from './chat/shared/chat.model';
import { Permission } from '@vmsl/core/auth/permission-key.enum';
import * as moment from 'moment';
import { RoleName } from '@vmsl/core/enums';
import { Helper } from './calendar/shared/utils';
import { CalendarService } from './calendar/calendar.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent extends RouteComponentBase {
  @ViewChild('sessionExpireDialog', { read: TemplateRef })
  sessionExpireDialog: TemplateRef<NbDialogModule>;
  @ViewChild('incomingCallDialog', { read: TemplateRef })
  incomingCallDialog: TemplateRef<NbDialogModule>;
  @ViewChild('maCallDialog', { read: TemplateRef })
  maCallDialog: TemplateRef<NbDialogModule>;
  @ViewChild('markOnlineDialog', { read: TemplateRef })
  markOnlineDialog: TemplateRef<NbDialogModule>;
  menuItems: NbMenuItem[] = menuItem();
  countdown: number;
  userId = this.store.getUser().id;
  tenantId = this.store.getUser().tenantId;
  commonChannel = this.tenantId;
  userChannel = `${this.userId}_${this.tenantId}`;
  caller = new UserInfo();
  callDialog: NbDialogRef<NbDialogModule>;
  markOnlineDialogRef: NbDialogRef<NbDialogModule>;
  callerTone: HTMLAudioElement;
  callData;
  teams: TeamInfo[];
  missedCallTimeout;
  receivedCall = false;
  sessionDialog: NbDialogRef<NbDialogModule>;
  lastPing: Date = null;
  pubnubListnerObj: object;
  browserSupported = false;
  maCall: MALink;
  isMeetingPage: boolean;
  refreshTokenInterval: NodeJS.Timeout;
  newChat: Chat;
  chatWindowList = [];
  removeChatfromList: Chat;
  permissionKey = Permission;
  currentYear = new Date().getFullYear();

  private readonly destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly store: UserSessionStoreService,
    private readonly pubnub: PubNubAngular,
    private readonly router: Router,
    private readonly dialogService: NbDialogService,
    private readonly menuService: NbMenuService,
    private readonly permissionsService: NgxPermissionsService,
    private readonly authService: AuthService,
    private readonly breakpointService: NbMediaBreakpointsService,
    private readonly sidebarService: NbSidebarService,
    private readonly userFacade: UserFacadeService,
    private readonly opentokService: OpentokService,
    private readonly teamsFacade: TeamsFacadeService,
    private readonly toastrService: ToastrService,
    private readonly idle: Idle,
    private readonly keepalive: Keepalive,
    private readonly msalService: AzureMsalFacadeService,
    private readonly el: ElementRef,
    private readonly iconLibraries: NbIconLibraries,
    private readonly maFacade: MaCallingService,
    private readonly chatFacade: ChatFacadeService,
    private readonly calendarService: CalendarService,
  ) {
    super(route, location);
    this.callerTone = new Audio();
    this.callerTone.autoplay = true;
    this.initPubnub();

    // register Screen Share Icons for conference
    this.iconLibraries.registerSvgPack('custom-icons', icons);

    this._subscriptions.push(
      this.chatFacade.chatObv.subscribe(resp => {
        if (resp) {
          if (resp['teamId']) {
            this.handleTeamChatNotification(resp);
          } else {
            this.handleChatNotification(resp);
          }
        }
      }),
    );
  }

  handleChatNotification(resp) {
    const maxChatWindow = 3;
    let chat = new Chat();
    if (resp.addParticipants) {
      this.addParticipantsToNewChat(resp);
    }
    if (!resp['channelId'] && !resp.participants) {
      const user = new UserInfo();
      user.firstName = this.store.getUser().firstName;
      user.lastName = this.store.getUser().lastName;
      user.userTitle = 'You';
      user.userTenantId = this.store.getUser().userTenantId;
      if (this.store.getUser().photoUrl) {
        this.chatFacade.getSignedUrl().subscribe(res => {
          user.photoUrl = res['url'];
        });
      }
      chat.participants = [resp, user];
      chat.chatName = resp.fullName;
      chat.chatTitle = resp.userTitle;
      chat.chatProfile = resp.photoUrl;
      chat.date = moment().format('LT');
    } else {
      chat = resp;
    }
    if (!this.chatExistInChatWindowList(chat)) {
      if (resp['channelId']) {
        this.chatWindowList = [...this.chatWindowList, chat];
        if (this.chatWindowList.length > maxChatWindow) {
          this.chatWindowList.shift();
        }
      } else {
        this.checkIfChatExist(chat);
      }
    }
  }

  handleTeamChatNotification(data) {
    const maxChatWindow = 3;
    let chat = new Chat();
    if (!data['channelId']) {
      chat.teamId = data.teamId;
      chat.chatName = data.teamName;
      chat.chatTitle = 'Team';
      chat.date = moment().format('LT');
      chat.teamChat = true;
      chat.participants = this.getTeamParticipants(data);
    } else {
      chat = data;
    }
    if (!this.chatExistInChatWindowList(chat)) {
      if (data['channelId']) {
        this.chatWindowList = [...this.chatWindowList, chat];
        if (this.chatWindowList.length > maxChatWindow) {
          this.chatWindowList.shift();
        }
      } else {
        this.checkIfChatExist(chat);
      }
    }
  }

  getTeamParticipants(data) {
    const user = new UserInfo();
    user.firstName = this.store.getUser().firstName;
    user.lastName = this.store.getUser().lastName;
    user.userTitle = 'You';
    user.userTenantId = this.store.getUser().userTenantId;
    if (this.store.getUser().photoUrl) {
      this.chatFacade.getSignedUrl().subscribe(res => {
        user.photoUrl = res['url'];
      });
    }
    let participants = data.allMembers.map(member => {
      return {
        name: member.user_name,
        roleName: member.role_name,
        job_title: member.jobTitle,
        userTenantId: member.user_tenant_id,
        photoUrl: member.photoUrl,
      };
    });
    //filter HCP from participants
    participants = participants.filter(
      participant => participant.roleName !== RoleName.hcp,
    );
    return [...participants, user];
  }

  checkIfChatExist(chat) {
    const maxChatWindow = 3;
    this.chatFacade.findExistingChat(chat).subscribe(res => {
      if (res.channelId) {
        chat.channelId = res.channelId;
        this.chatWindowList = [...this.chatWindowList, chat];
        this.newChat = chat;
      } else {
        this.newChat = chat;
        this.chatWindowList = [...this.chatWindowList, chat];
      }
      if (this.chatWindowList.length > maxChatWindow) {
        this.chatWindowList.shift();
      }
    });
  }

  addParticipantsToNewChat(data) {
    const chat = new Chat();
    chat.participants = data.participants.concat(data.addParticipants);
    chat.participants.forEach(ele => {
      if (ele['userTenantId'] !== this.store.getUser().userTenantId) {
        const name = ele['fullName'] || ele['name'];
        chat.chatName = chat.chatName ? `${chat.chatName}, ${name}` : name;
      }
    });
    chat.chatTitle = 'Group';
    chat.date = data.date;
    this.checkIfChatExist(chat);
  }

  closeChat(chat: Chat) {
    if (chat.channelId) {
      this.chatWindowList = this.chatWindowList.filter(
        ele => ele.channelId !== chat.channelId,
      );
    } else if (chat.teamChat) {
      this.chatWindowList = this.chatWindowList.filter(
        ele => ele.teamId !== chat.teamId,
      );
      this.removeChatfromList = chat;
    } else {
      this.chatWindowList = this.chatWindowList.filter(
        ele => !lodash.isEqual(ele.participants, chat.participants),
      );
      this.removeChatfromList = chat;
    }
  }

  chatExistInChatWindowList(chat) {
    let chatExist;
    if (chat.channelId) {
      chatExist = this.chatWindowList.find(
        ele => ele.channelId === chat.channelId,
      );
    } else if (chat.teamChat) {
      chatExist = this.chatWindowList.find(ele => ele.teamId === chat.teamId);
    } else {
      const ids = [];
      chat.participants.forEach(element => {
        ids.push(element.userTenantId);
      });
      this.chatWindowList.forEach(ele => {
        const id = [];
        ele.participants.forEach(element => {
          id.push(element.userTenantId);
        });
        const array1 = ids.filter(val => !id.includes(val));
        if (!array1.length) {
          chatExist = ele;
        }
      });
    }
    return chatExist;
  }

  ngOnInit() {
    super.ngOnInit();
    this.isMeetingPage = this.router.url.includes('meeting');
    if (!OT.checkSystemRequirements()) {
      this.browserSupported = true;
    }
    this.setMenus();
    if (this.store.getUser().permissions.includes('ViewAzureTenantConfig')) {
      this._subscriptions.push(
        this.msalService.getAzureTenantConfig().subscribe(),
      );
    }

    const { sm } = this.breakpointService.getBreakpointsMap();
    this._subscriptions.push(
      this.menuService
        .onItemClick()
        .pipe(takeUntil(this.destroyed$))
        .subscribe(event => {
          if (document.documentElement.clientWidth < sm) {
            this.sidebarService.collapse('menu-sidebar');
          }
          this.onContextItemSelection(event.item.title);
        }),
    );
  }

  ngAfterViewChecked() {
    // Add and Remove class in sidebar left menu
    const elements = this.el.nativeElement as HTMLElement;

    // add class with collapsed case
    const menuCollapsed = elements.querySelectorAll(
      '.menu-sidebar ul.menu-items.collapsed',
    );
    if (menuCollapsed) {
      menuCollapsed.forEach(element => {
        element.parentElement.classList.add('arrow-right');
      });
    }

    // remove class with expanded case
    const menuExpended = elements.querySelectorAll(
      '.menu-sidebar ul.menu-items.expanded',
    );
    if (menuExpended) {
      menuExpended.forEach(element => {
        element.parentElement.classList.remove('arrow-right');
      });
    }

    const menuOpen = document.querySelector('nb-layout-header');
    const menuClose = document.querySelector('nb-layout-header.menu-closed');

    this._subscriptions.push(
      this.sidebarService.onToggle().subscribe(() => {
        if (menuOpen) {
          menuOpen.classList.add('menu-closed');
        }
        if (menuClose) {
          menuClose.classList.remove('menu-closed');
        }
      }),
    );
  }

  initPubnub() {
    this.startIdleTimer();
    this.pubnub.init({
      subscribeKey: this.store.getPubnubSubsKey(),
      uuid: this.store.getUser().id,
      presenceTimeout: 60,
      heartbeatInterval: 30,
    });
    this.subscribeToPubnub();
  }

  subscribeToPubnub() {
    this.pubnub.subscribe({
      channels: [this.commonChannel, this.userChannel],
      withPresence: true,
    });
    if (this.store.getUser().role === '6') {
      this.subscribeToTeams();
    }
    this.pubnub.getState(
      {
        uuid: this.store.getUser().id,
        channels: [this.commonChannel],
      },
      (status, response) => {
        if (response.channels[this.commonChannel]?.status === 'Busy') {
          if (!this.store.getCallTab()) {
            this.store.setCallTab(true);
            this.idle.stop();
          }
        }
      },
    );
    this.pubnubListner();
  }

  pubnubListner() {
    this.pubnubListnerObj = {
      presence: event => {
        this.pubnubEventListner(event);
      },
      status: status => {
        this.pubnubStatusListner(status);
      },
      message: m => {
        const callData = JSON.parse(m.message);
        if (
          callData.subject &&
          callData.subject === 'User-Deleted' &&
          this.store.getUser().id === callData.userId
        ) {
          this.toastrService.success(
            'You are being logged out of the system.',
            'User deleted.',
            {
              timeOut: environment.messageTimeout,
            },
          );
          const timeout = 2000;
          setTimeout(() => {
            this.authService.logout().subscribe();
          }, timeout);
        }
        if (callData.subject === 'Pdf-Created') {
          this.toastrService.success(
            'Your Audit Logs PDF has been downloaded successfuly.',
            'Success',
            {
              timeOut: environment.messageTimeout,
            },
          );
          this.store.setAuditLogPDFStatus(false);
          const downloadLink = document.createElement('a');
          downloadLink.href = callData.fileUrl;
          downloadLink.download = 'download';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
        if (!callData?.notificationData?.teamDetails) {
          this.handleCallNotifications(callData);
        }
      },
    };
    this.pubnub.addListener(this.pubnubListnerObj);
  }

  subscribeToTeams() {
    const teamChannels = [];
    this._subscriptions.push(
      this.teamsFacade.getTeams().subscribe(res => {
        res.forEach(ele => {
          teamChannels.push(ele.teamId);
        });
        this.pubnub.subscribe({
          channels: [teamChannels],
          withPresence: true,
        });
      }),
    );
  }

  pubnubEventListner(event) {
    if (event.uuid === this.userId && event.action === 'leave') {
      //logging user out since user has either logged out his session from other tab or has been offline for more than 5 mins
      if (this.store.getAccessToken()) {
        this._subscriptions.push(this.authService.logout().subscribe());
      } else {
        const loginUrl = '/login';
        window.location.href = loginUrl;
      }
    }

    if (
      event.uuid === this.userId &&
      event.action === 'state-change' &&
      event.state.status !== 'Busy'
    ) {
      this.reset();
    }
    if (
      event.uuid === this.userId &&
      event.action === 'state-change' &&
      event.state.status === 'Busy'
    ) {
      this.idle.stop();
      this.keepalive.start();
    }
  }

  pubnubStatusListner(status) {
    if (
      status.category === 'PNNetworkUpCategory' ||
      status.category === 'PNReconnectedCategory'
    ) {
      this.pubnub.subscribe({
        channels: [this.commonChannel, this.userChannel],
        withPresence: true,
      });
      if (this.store.getUser().role === '6') {
        this.subscribeToTeams();
      }
    }
  }

  handleCallNotifications(callData) {
    if (callData?.notificationType === 'MoD') {
      this.handleMACallNotif(callData);
    } else if (callData?.notificationType === 'rsvp_event') {
      this.updateDeclineEvent(callData);
    } else {
      switch (callData?.notificationData?.callStatus) {
        case 'InitiateCall':
          this.initiateCall(callData);
          break;
        case 'PickedCall':
          this.pickedCall(callData);
          break;
        case 'MissedCall':
        case 'DisconnectedCall':
        case 'inviteeDisconnected':
        case 'ownerDisconnected':
          this.disconnectCall(callData);
          break;
        default:
          if (
            (callData.notificationMainType === 'USER' ||
              callData.eventUpdateNotification ||
              callData.attendeeRemoved) &&
            callData.notificationData.body !== ''
          ) {
            this.toastrService.info(
              callData.notificationData.body,
              'ATTENTION',
              {
                timeOut: environment.messageTimeout,
              },
            );
            this.userFacade.setWebNotification(true);
          }
          break;
      }
    }
  }

  updateDeclineEvent(eventData) {
    let newEvent;
    this.calendarService
      .getEventById(eventData.notificationData.eventId)
      .subscribe(resp => {
        newEvent = resp[0];
        let newEventStatus = 'tentative';
        let removeAttnIndexInArr;
        const attendeeId = eventData.notificationData.declinedBy.attendeeId;
        newEvent.attendees.forEach((attnInfo, index) => {
          if (attnInfo.attendeeId === attendeeId) {
            removeAttnIndexInArr = index;
          }
          if (
            attnInfo.attendeeId !== attendeeId &&
            !attnInfo.isOrganizer &&
            attnInfo.response === 'accepted'
          ) {
            newEventStatus = 'confirmed';
          }
        });
        const EventRef = { ...newEvent };
        EventRef.attendees.splice(removeAttnIndexInArr, 1);
        const newTitle = Helper.createTitleOfEvent(EventRef);
        const obj = {
          deleted: true,
          id: eventData.notificationData.declinedBy.userId,
          attendeeId: eventData.notificationData.declinedBy.attendeeId,
        };
        this.executeAllEventEditOperations(
          [],
          [obj],
          { title: newTitle, status: newEventStatus },
          newEvent,
        );
      });
  }

  executeAllEventEditOperations(
    newAttendees,
    updatedOrDeletedAttendees,
    changedEventValues,
    newEvent,
  ) {
    const listOfOperationObservables = [];
    if (newAttendees?.length) {
      listOfOperationObservables.push(
        this.calendarService.createAttendees(newAttendees, newEvent.id),
      );
    }
    if (updatedOrDeletedAttendees?.length) {
      listOfOperationObservables.push(
        this.calendarService.updateAttendees(
          updatedOrDeletedAttendees,
          newEvent.id,
        ),
      );
    }
    if (Object.getOwnPropertyNames(changedEventValues).length > 0) {
      listOfOperationObservables.push(
        this.calendarService.updateEvent(changedEventValues, newEvent.id),
      );
    }
    if (listOfOperationObservables?.length) {
      forkJoin(...listOfOperationObservables).subscribe();
    }
  }

  pickedCall(callData) {
    clearTimeout(this.missedCallTimeout);
    this.receivedCall = false;
    if (this.callDialog) {
      this.callDialog.close();
    }
    this.stopRingtone();
  }

  handleMACallNotif(callData) {
    const popupTimeout = 15000;
    switch (callData?.notificationData?.callStatus) {
      case 'InitiateCall':
        this.initiateMaCall(callData);
        break;
      case 'MissedCall':
      case 'DisconnectedCall':
        if (this.callDialog) {
          this.callDialog.close();
        }
        this.stopRingtone();
        this.store.removeCallTab();
        break;
      case 'PickedCall':
        if (this.maCall) {
          this.maCall.receiver.firstName =
            callData.notificationData.picker.firstName;
          this.maCall.receiver.lastName =
            callData.notificationData.picker.lastName;
          this.stopRingtone();
          this.store.removeCallTab();
          setTimeout(() => {
            if (this.callDialog) {
              this.callDialog.close();
            }
          }, popupTimeout);
        }
        break;
    }
  }

  initiateMaCall(callData) {
    if (!this.receivedCall && !this.store.getCallTab()) {
      this.store.setCallTab(true);
      this.maCall = new MALink();
      this.maCall.hcpText = callData.notificationData.hcpOrPayor;
      this.maCall.payorHcp = callData.notificationData.isPayor
        ? 'Payor'
        : 'HCP';
      this.maCall.questionText = callData.notificationData.requestText;
      this.maCall.question = callData.notificationData.questions;
      this.maCall.diseaseArea = callData.notificationData.divTags[0].filterDa;
      this.maCall.therapeuticArea =
        callData.notificationData.divTags[0].filterTa;
      this.maCall.territory =
        callData.notificationData.divTags[0].filterTerritory;
      this.maCall.jobTitle =
        callData.notificationData.divTags[0].filterJobTitle;
      this.maCall.team = callData.notificationData.teams || [];
      this.maCall.caller.firstName =
        callData.notificationData.callerDetails.firstName;
      this.maCall.caller.lastName =
        callData.notificationData.callerDetails.lastName;
      this.maCall.caller.roleName =
        callData.notificationData.callerDetails.roleName;
      this.maCall.caller.userTitle =
        callData.notificationData.callerDetails.jobTitle ||
        callData.notificationData.callerDetails.roleName;
      this.maCall.caller.id = callData.notificationData.callerDetails.id;
      this.maCall.caller.photoUrl =
        callData.notificationData.callerDetails.photoUrl;
      this.maCall.selected = callData.notificationData.to;
      this.maCall.maLink = callData.notificationData.Malink;
      this.maCall.eventId = callData.notificationData.eventId;
      this.maCall.isVmslCall = callData.notificationData.onVmslCall;
      this.callDialog = this.dialogService.open(this.maCallDialog, {
        closeOnBackdropClick: false,
        closeOnEsc: false,
      });
      this.playRingtone();
    } else {
      this.missedMaCall();
    }
  }

  acceptMaCall() {
    this.stopRingtone();
    this.callDialog.close();
    if (this.maCall.isVmslCall) {
      this._subscriptions.push(
        this.maFacade.pickCall(this.maCall).subscribe(res => {
          this.store.setMaCallData(res);
          window.open(`/main/meeting?maCall=true`);
        }),
      );
    } else {
      const refreshTokenTimeout = 43200000;
      this._subscriptions.push(
        this.maFacade.pickCall(this.maCall).subscribe(res => {
          this.store.removeCallTab();
          this.markOnlineDialogRef = this.dialogService.open(
            this.markOnlineDialog,
            {
              closeOnBackdropClick: false,
              closeOnEsc: false,
            },
          );
          this.idle.stop();
          this.keepalive.start();
          this.refreshTokenInterval = setInterval(() => {
            this.authService.refreshToken().subscribe();
          }, refreshTokenTimeout);
          if (
            this.maCall.maLink.includes('http://') ||
            this.maCall.maLink.includes('https://')
          ) {
            window.open(this.maCall.maLink);
          } else {
            window.open(`http://${this.maCall.maLink}`);
          }
        }),
      );
    }
  }

  missedMaCall() {
    this._subscriptions.push(this.maFacade.missedCall(this.maCall).subscribe());
  }

  declineMaCall() {
    if (this.callDialog) {
      this.callDialog.close();
    }
    this.stopRingtone();
    this.store.removeCallTab();
    this._subscriptions.push(
      this.maFacade
        .disconnectMissedCall('disconnected', this.maCall)
        .subscribe(),
    );
  }

  markOnline() {
    this.reset();
    clearInterval(this.refreshTokenInterval);
    this.markOnlineDialogRef.close();
    this._subscriptions.push(
      this.maFacade
        .disconnectMissedCall('disconnected', this.maCall)
        .subscribe(),
    );
  }

  initiateCall(callData) {
    if (!this.receivedCall && !this.store.getCallTab()) {
      const timeout = 45000;
      this.store.setCallTab(true);
      this.callData = callData;
      this.caller.firstName =
        this.callData.notificationData.callerDetails.firstName;
      this.caller.lastName =
        this.callData.notificationData.callerDetails.lastName;
      this.caller.roleName =
        this.callData.notificationData.callerDetails.roleName === 'Junior HCP'
          ? 'Healthcare Professional'
          : this.callData.notificationData.callerDetails.roleName;
      this.caller.userTitle =
        this.callData.notificationData.callerDetails.jobTitle ||
        this.caller.roleName;
      this.caller.photoUrl =
        this.callData.notificationData.callerDetails.photoUrl;
      this.callDialog = this.dialogService.open(this.incomingCallDialog, {
        closeOnBackdropClick: false,
        closeOnEsc: false,
      });
      this.receivedCall = true;
      this.playRingtone();
      this.missedCallTimeout = setTimeout(() => {
        this.handleMissedCall(this.callData);
      }, timeout);
    } else {
      const data = callData;
      const timeout = 5000;
      setTimeout(() => {
        this._subscriptions.push(
          this.opentokService
            .missedCall(
              data.notificationData.from,
              data.notificationData.callType,
              data.notificationData.eventId,
              'busy',
            )
            .subscribe(),
        );
      }, timeout);
    }
  }

  disconnectCall(callData) {
    clearTimeout(this.missedCallTimeout);
    this.receivedCall = false;
    if (this.callDialog) {
      this.callDialog.close();
    }
    this.stopRingtone();
    this.store.removeCallTab();
  }

  handleMissedCall(callData) {
    this.receivedCall = false;
    this.store.removeCallTab();
    clearTimeout(this.missedCallTimeout);
    this._subscriptions.push(
      this.opentokService
        .missedCall(
          callData.notificationData.from,
          callData.notificationData.callType,
          callData.notificationData.eventId,
        )
        .subscribe(res => {
          this.callDialog.close();
          this.stopRingtone();
        }),
    );
  }

  connectToCall() {
    this.receivedCall = false;
    clearTimeout(this.missedCallTimeout);
    this.callDialog.close();
    this.stopRingtone();
    window.open(
      `/main/meeting?from=${this.callData.notificationData.from}&meetingType=${this.callData.notificationData.callType}&eventId=${this.callData.notificationData.eventId}`,
    );
  }

  declineCall() {
    this.store.removeCallTab();
    this.receivedCall = false;
    clearTimeout(this.missedCallTimeout);
    this._subscriptions.push(
      this.opentokService
        .leaveMeeting(this.callData.notificationData.eventId, false, false)
        .subscribe(res => {
          this.callDialog.close();
          this.stopRingtone();
        }),
    );
  }

  playRingtone() {
    this.callerTone.src = '../../../assets/audio/simple_marimba.mp3';
    this.callerTone.loop = true;
    this.callerTone.play();
  }

  stopRingtone() {
    this.callerTone.pause();
    this.callerTone.src = '';
  }

  onContextItemSelection(title) {
    if (title === 'Medical onDemand') {
      this.dialogService.open(MaLinkComponent, {
        closeOnBackdropClick: false,
        closeOnEsc: false,
      });
    }
  }

  private setMenus() {
    this.permissionsService.permissions$
      .pipe(
        distinctUntilChanged(
          (
            currentValue: NgxPermissionsObject,
            previousValue: NgxPermissionsObject,
          ) =>
            lodash.isEqual(
              lodash.keys(currentValue),
              lodash.keys(previousValue),
            ),
        ),
      )
      .subscribe(() => {
        this._setHiddenMenus(this.menuItems);
      });

    this._subscriptions.push(
      this.router.events
        .pipe(filter(event => event instanceof RouterEvent))
        .subscribe(event => {
          if (event instanceof NavigationStart) {
            const authToken = this.store.getAccessToken();
            if (!authToken && event.url !== '/login') {
              this.authService.logout();
            }
          }
        }),
    );
  }

  private _setHiddenMenus(menuItems: NbMenuItem[]) {
    menuItems.forEach(async menuToHide => {
      if (menuToHide.data && menuToHide.data.view !== 'Dashboard') {
        menuToHide.hidden = true;
      } else {
        await this._setHidden(menuToHide);
        if (menuToHide.children && menuToHide.children.length > 0) {
          this._setHiddenMenus(menuToHide.children);
        }
      }
    });
  }

  private async _setHidden(mItem: NbMenuItem) {
    mItem.hidden =
      mItem.data &&
      mItem.data.permission &&
      mItem.data.permission !== '*' &&
      !(await this.permissionsService.hasPermission(mItem.data.permission));
  }

  startIdleTimer() {
    const idleTime = 43200;
    const interval = 15;
    this.idle.setIdle(idleTime);
    this.keepalive.interval(interval);

    this.idle.onIdleEnd.subscribe(() => this.sessionDialog.close());
    this.idle.onTimeout.subscribe(() => {
      this.logout();
    });

    this.keepalive.onPing.subscribe(() =>
      this.store.setlastActivity(new Date()),
    );
    this.reset();
  }

  reset() {
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
    this.idle.watch();
  }

  logout() {
    this.authService.logout().subscribe(
      () => {
        this.store.setLastRoute(window.location.pathname);
        this.store.setMessage('sessionExpire');
      },
      err => {
        this.store.setLastRoute(window.location.pathname);
        this.store.setMessage('sessionExpire');
      },
    );
  }

  ngOnDestroy() {
    clearInterval(this.refreshTokenInterval);
    super.ngOnDestroy();
    this.pubnub.removeListener(this.pubnubListnerObj);
  }
}
