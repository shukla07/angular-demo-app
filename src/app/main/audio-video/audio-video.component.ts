import {
  Component,
  ChangeDetectorRef,
  ViewEncapsulation,
  Inject,
  HostListener,
  ElementRef,
  ViewChild,
  Renderer2,
  TemplateRef,
} from '@angular/core';
import {OpentokService} from './shared/opentok.service';
import * as OT from '@opentok/client';
import {
  NbDialogRef,
  NbIconLibraries,
  NbDialogModule,
  NbDialogService,
} from '@nebular/theme';
import {PubNubAngular} from 'pubnub-angular2';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {DOCUMENT, Location} from '@angular/common';
import {ToastrService} from 'ngx-toastr';
import {environment} from '@vmsl/env/environment';
import {Call} from './shared/models/call.model';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {ActivatedRoute} from '@angular/router';
import {UserFacadeService} from '@vmsl/shared/facades/user-facade.service';
import {UserInfo} from '@vmsl/core/auth/models/user.model';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {
  screenShareActive,
  screenShare,
  screenShareDisabled,
  switchCamera,
} from './screen-share-icons';
import {STATUS_CODE} from '@vmsl/core/api/error-code';
import {deviceIncompatible} from '../../../assets/message/notification';
import {timer} from 'rxjs';

@Component({
  selector: 'vmsl-audio-video',
  templateUrl: './audio-video.component.html',
  styleUrls: ['./audio-video.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [OpentokService],
})
export class AudioVideoComponent extends RouteComponentBase {
  @ViewChild('publisher') publisher: ElementRef;
  @ViewChild('presentingScreen') presentingScreen: ElementRef;
  @ViewChild('parentScreenPreview') parentScreenPreview: ElementRef;
  @ViewChild('disconnectCallDialog', {read: TemplateRef})
  disconnectCallDialog: TemplateRef<NbDialogModule>;
  @ViewChild('addAttendeeDialog', {read: TemplateRef})
  addAttendeeDialog: TemplateRef<NbDialogModule>;

  session: OT.Session;
  streams: Array<OT.Stream> = [];
  callDetails: Call;
  fullScreenMode = false;
  elementId = 'full-screen-mode';
  callerTone: HTMLAudioElement;
  timeout;
  screenPublisher: OT.Publisher;
  screenSubs: boolean;
  addUser = false;
  myContacts: UserInfo[];
  permissionKey = Permission;
  addAttendeeDetails: {message: string; id: string};
  attendeedialog: NbDialogRef<NbDialogModule>;
  videoDevices = [];
  facingMode = false;
  connected = false;

  shareIcon = false;
  recording = false;
  micIcon = true;
  videoIcon = false;
  isMobileScreen = false;
  disconnectString = 'Call Disconnected';
  userSharingScreen: string;
  pubnubListner: Object;
  timerDisplay: string;

  constructor(
    protected readonly dialogRef: NbDialogRef<AudioVideoComponent>,
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly opentokService: OpentokService,
    private readonly pubnub: PubNubAngular,
    private readonly store: UserSessionStoreService,
    private readonly renderer: Renderer2,
    private readonly toasterService: ToastrService,
    private readonly userFacade: UserFacadeService,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly iconLibraries: NbIconLibraries,
    private readonly dialogService: NbDialogService,
  ) {
    super(route, location);
    // sonarignore:start
    window.addEventListener('beforeunload', e => {
      if (this.document.baseURI !== environment.baseUrl) {
        return;
      }
      this.store.removeCallTab();
    });
    // sonarignore:end
    this.callerTone = new Audio();
    this.callerTone.autoplay = true;

    // If Full Screen Mode ON/OFF call exitHandler() Function
    if (this.document.addEventListener) {
      this.document.addEventListener(
        'webkitfullscreenchange',
        this.exitHandler.bind(this),
        false,
      );
      this.document.addEventListener(
        'mozfullscreenchange',
        this.exitHandler.bind(this),
        false,
      );
      this.document.addEventListener(
        'fullscreenchange',
        this.exitHandler.bind(this),
        false,
      );
      this.document.addEventListener(
        'MSFullscreenChange',
        this.exitHandler.bind(this),
        false,
      );
    }

    // register Screen Share Icons for conference
    this.iconLibraries.registerSvgPack('screen-share-icons', {
      'screen-share-active': screenShareActive,
      'screen-share': screenShare,
      'screen-share-disabled': screenShareDisabled,
      'switch-camera': switchCamera,
    });
  }

  ngOnInit() {
    const timeout = 5000;
    if (!OT.checkSystemRequirements()) {
      this.toasterService.warning(deviceIncompatible, 'Incompatible Browser', {
        timeOut: environment.messageTimeout,
      });
      setTimeout(() => {
        window.close();
      }, timeout);
    } else {
      if (this.store.getCallDeclined()) {
        this.toasterService.warning(
          'Your call has been declined.',
          this.disconnectString,
          {
            timeOut: environment.messageTimeout,
          },
        );
        setTimeout(() => {
          window.close();
        }, timeout);
      } else {
        this.initCall();
      }
    }
  }

  initCall() {
    if (this.store.getCallData()) {
      this.connected = this.store.getCallConnected();
      this.callDetails = this.store.getCallData();
      this.videoIcon =
        this.store.getCallData().mediaType === 'video' ? true : false;
      this.initSession(
        this.callDetails.apiKey,
        this.callDetails.sessionId,
        this.callDetails.token,
      );
    } else if (this.getQueryParam('maCall')) {
      this.connected = true;
      this.store.setCallConnected(true);
      this.callDetails = this.store.getMaCallData();
      this.store.setCallData(this.store.getMaCallData());
      this.store.removeMaCallData();
      this.initSession(
        this.callDetails.apiKey,
        this.callDetails.sessionId,
        this.callDetails.token,
      );
    } else {
      const meetingType = this.getQueryParam('meetingType');
      const to = this.getQueryParam('to');
      const from = this.getQueryParam('from');
      const teamIdTo = this.getQueryParam('teamTo');
      const teamIdFrom = this.getQueryParam('teamFrom');
      const queueId = this.getQueryParam('queueId');
      this.videoIcon = meetingType === 'video' ? true : false;
      if (to) {
        this.makeAdhocCall(to, meetingType);
      } else if (from) {
        this.pickAdhocCall(from, meetingType);
      } else if (teamIdTo) {
        this.makeAdhocTeamCall(teamIdTo, meetingType);
      } else if (teamIdFrom) {
        this.pickOrendAdhocTeamCall('pickCall', queueId, teamIdFrom);
      } else {
        this.joinMeeting();
      }
    }
    this.callListener();
    this.mobileDevicesCheck();
    this.cameraCheck();

    // disabled right click
    document.addEventListener('contextmenu', event => event.preventDefault());
  }

  cameraCheck() {
    const isIOS = navigator.userAgent.match(/iPhone|iPad|iPod/i);

    if (isIOS) {
      navigator.mediaDevices.getUserMedia({video: true}).then(() => {
        this.deviceCheck();
      });
    } else {
      this.deviceCheck();
    }
  }

  deviceCheck() {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      this.videoDevices = devices.filter(
        device => device.kind === 'videoinput',
      );
    });
  }

  switchCamera() {
    this.facingMode = !this.facingMode;
  }

  initSession(apiKey: string, sessionId: string, token: string) {
    const missedCallTimer = 45000;
    let time = this.store.getCallDuration() ? this.store.getCallDuration() : 0;
    const second = 1000;
    this.opentokService
      .initSession(apiKey, sessionId, token)
      .then((session: OT.Session) => {
        this.session = session;
        timer(0, second).subscribe(ellapsedCycles => {
          time++;
          this.timerDisplay = this.getDisplayTimer(time);
          this.store.setCallDuration(time);
        });
        setTimeout(() => {
          if (this.streams.length === 0) {
            this.handleMissedCall();
          }
        }, missedCallTimer);
        this.handleSessionEvents();
      })
      .then(() => {
        this.opentokService.connect();
      })
      .catch(err => {
        this.unpublish();
        if (err.code === STATUS_CODE.INTERNET_CONNEACTION_ISSUE) {
          this.toasterService.error(
            'Please check your internet connection and try again.',
            'Connection failure',
            {
              timeOut: environment.messageTimeout,
            },
          );
        } else {
          this.toasterService.error(
            'An error has occurred. Please try again.',
            'Connection failure',
            {
              timeOut: environment.messageTimeout,
            },
          );
        }
      });
  }

  handleSessionEvents() {
    this.session.on({
      streamCreated: event => {
        if (event.stream.videoType === 'screen') {
          this.screenSubs = true;
          this.userSharingScreen = event.stream.name;
          const parentElementId = 'screen-sharing-container';
          this.session.subscribe(event.stream, parentElementId, {
            insertMode: 'append',
            audioVolume: 60,
          });
        } else {
          this.streams.push(event.stream);
        }
        this.changeDetectorRef.detectChanges();
      },
      streamDestroyed: event => {
        const idx = this.streams.indexOf(event.stream);
        if (event.stream.videoType === 'screen') {
          this.screenSubs = false;
        } else {
          this.toasterService.info(
            '',
            `${event.stream.name} has left the meeting.`,
            {
              timeOut: environment.messageTimeout,
            },
          );
        }
        if (idx > -1) {
          this.streams.splice(idx, 1);
          this.changeDetectorRef.detectChanges();
        }
      },
      sessionReconnecting: event => {
        this.toasterService.warning(
          '',
          'Disconnected from the session. System attempting to reconnect.',
          {
            timeOut: environment.messageTimeout,
          },
        );
      },
      sessionReconnected: event => {
        this.toasterService.warning('Reconnected to the session.', '', {
          timeOut: environment.messageTimeout,
        });
      },
      sessionDisconnected: event => {
        this.unpublish();
        this.toasterService.error(
          'Please check your internet connection and try again.',
          'Disconnected from the session',
          {
            timeOut: environment.messageTimeout,
          },
        );
      },
    });
  }

  getDisplayTimer(time: number) {
    const toSeconds = 3600;
    const toMinutes = 60;
    const two = -2;
    const hours = '0' + Math.floor(time / toSeconds);
    const h = `${hours.slice(two, -1)}${hours.slice(-1)}`;
    const minutes = '0' + Math.floor((time % toSeconds) / toMinutes);
    const m = `${minutes.slice(two, -1)}${minutes.slice(-1)}`;
    const seconds = '0' + Math.floor((time % toSeconds) % toMinutes);
    const s = `${seconds.slice(two, -1)}${seconds.slice(-1)}`;

    return `${h}: ${m}: ${s}`;
  }

  callListener() {
    this.pubnubListner = {
      message: m => {
        const data = JSON.parse(m.message);
        if (
          data.notificationData?.callStatus &&
          data.notificationData.from !== this.store.getUser().id &&
          data.notificationData.eventId === this.callDetails.eventId &&
          data.notificationData.callType !== 'MoD'
        ) {
          this.handleCallNotification(data);
        }
      },
    };
    this.pubnub.addListener(this.pubnubListner);
  }

  handleCallNotification(data) {
    switch (data.notificationData.callStatus) {
      case 'DisconnectedCall':
        this.store.setCallDeclined(true);
        this.unpublish();
        if (!this.connected) {
          const timeout = 5000;
          this.toasterService.warning(
            'Your call has been declined.',
            this.disconnectString,
            {
              timeOut: environment.messageTimeout,
            },
          );
          setTimeout(() => {
            window.close();
          }, timeout);
        } else {
          window.close();
        }
        break;
      case 'PickedCall':
        this.connected = true;
        this.store.setCallConnected(true);
        if (this.callerTone) {
          this.stopAudio();
        }
        break;
      case 'MissedCall':
        this.toasterService.warning(
          data.notificationData.message,
          this.disconnectString,
          {
            timeOut: environment.messageTimeout,
          },
        );
        if (!this.connected) {
          const timeout = 5000;
          this.unpublish();
          setTimeout(() => {
            window.close();
          }, timeout);
        }
        break;
      case 'ownerDisconnected':
        this.unpublishAndClose();
        break;
      case 'inviteeDisconnected':
        this.inviteeDisconnected(data);
        break;
    }
  }

  inviteeDisconnected(data) {
    if (!data.notificationData.onCall) {
      this.toasterService.warning(
        `${data.notificationData.calleeDetails.firstName} ${data.notificationData.calleeDetails.lastName} has declined your call.`,
        'Call Declined',
        {
          timeOut: environment.messageTimeout,
        },
      );
    }
  }

  getUsersToadd() {
    this.userFacade.getMyContacts().subscribe(res => {
      this.pubnub.hereNow(
        {
          channels: [this.store.getUser().tenantId],
          includeUUIDs: true,
          includeState: true,
        },
        (status, response) => {
          this.myContacts = [];
          response.channels[this.store.getUser().tenantId].occupants.forEach(
            user => {
              res.forEach(contact => {
                if (user.uuid === contact.id && !user.state) {
                  this.myContacts.push(contact);
                } else if (
                  user.uuid === contact.id &&
                  user.state &&
                  user.state.status !== 'Busy'
                ) {
                  this.myContacts.push(contact);
                } else {
                  // else block
                }
              });
            },
          );
          this.addUser = true;
        },
      );
    });
  }

  addParticipant(id: string, alreadyAdded = false) {
    this.addUser = false;
    this.opentokService
      .addAttendee(
        this.callDetails.eventId,
        id,
        this.videoIcon ? 'video' : 'audio',
        alreadyAdded,
      )
      .subscribe(res => {
        if (res.alreadyAdded) {
          this.addAttendeeDetails = res;
          this.attendeedialog = this.dialogService.open(this.addAttendeeDialog);
        } else {
          if (this.attendeedialog) {
            this.attendeedialog.close();
          }
        }
      });
  }

  makeAdhocCall(to, meetingType) {
    this.opentokService.makeCall(to, meetingType).subscribe(res => {
      if (res) {
        this.initSession(res.apiKey, res.sessionId, res.token);
        this.callDetails = res;
        this.playAudio('simple_tone_2010.mp3');
      }
    });
  }

  pickAdhocCall(from: string, meetingType: string) {
    this.opentokService
      .pickCall(from, meetingType, this.getQueryParam('eventId'))
      .subscribe(res => {
        this.initSession(res.apiKey, res.sessionId, res.token);
        this.callDetails = res;
        this.connected = true;
        this.store.setCallConnected(true);
      });
  }

  joinMeeting() {
    this.callDetails = this.store.getCallData();
    this.connected = true;
    this.store.setCallConnected(true);
    this.videoIcon =
      this.store.getCallData().mediaType === 'video' ? true : false;
    this.initSession(
      this.callDetails.apiKey,
      this.callDetails.sessionId,
      this.callDetails.token,
    );
  }

  makeAdhocTeamCall(team, meetingType) {
    this.opentokService.teamAdhocCall(team, meetingType).subscribe(res => {
      if (res) {
        this.callDetails = this.store.getCallData();
        this.initSession(res.apiKey, res.sessionId, res.token);
        this.playAudio('simple_tone_2010.mp3');
      }
    });
  }

  pickOrendAdhocTeamCall(action: string, queueId?: string, teamId?: string) {
    this.opentokService
      .endTeamAdhocCall(queueId, teamId, action)
      .subscribe(res => {
        if (action === 'pickCall') {
          this.callDetails = this.store.getCallData();
          this.videoIcon =
            this.callDetails.mediaType === 'video' ? true : false;
          this.initSession(res.apiKey, res.sessionId, res.token);
          this.store.setCallConnected(true);
          this.connected = true;
        } else if (action === 'missedCall') {
          const timeout = 5000;
          this.toasterService.warning(
            'Your call was not answered.',
            this.disconnectString,
            {
              timeOut: environment.messageTimeout,
            },
          );
          setTimeout(() => {
            this.unpublishAndClose();
          }, timeout);
        } else {
          this.unpublishAndClose();
        }
      });
  }

  leaveMeeting(owner = false, leave = false) {
    this.opentokService
      .leaveMeeting(this.callDetails.eventId, owner, true, leave)
      .subscribe(
        res => {
          if (res['isOwner']) {
            this.dialogService.open(this.disconnectCallDialog);
          } else {
            if (this.publisher) {
              this.unpublishAndClose();
            }
          }
        },
        err => this.unpublishAndClose(),
      );
  }

  disconnect() {
    if (this.callerTone) {
      this.stopAudio();
    }
    if (this.connected) {
      this.leaveMeeting();
    } else {
      if (this.callDetails.queueId) {
        this.pickOrendAdhocTeamCall(
          'disconnectCall',
          this.callDetails.queueId,
          this.callDetails.teamId,
        );
      } else {
        this.opentokService
          .disconnectCall(
            this.callDetails.mediaType,
            this.callDetails.eventId,
            this.callDetails.to,
          )
          .subscribe(res => {
            this.unpublishAndClose();
          });
      }
    }
  }

  unpublishAndClose() {
    this.publisher['publisher'].destroy();
    if (this.screenPublisher) {
      this.screenPublisher.destroy();
    }
    window.close();
    this.dialogRef.close();
  }

  unpublish() {
    this.stopAudio();
    this.publisher['publisher'].destroy();
    if (this.screenPublisher) {
      this.screenPublisher.destroy();
    }
    this.dialogRef.close();
  }

  handleMissedCall() {
    if (this.callDetails.queueId) {
      this.pickOrendAdhocTeamCall(
        'missedCall',
        this.callDetails.queueId,
        this.callDetails.teamId,
      );
    }
  }

  playAudio(src: string) {
    this.callerTone.src = `../../../assets/audio/${src}`;
    this.callerTone.loop = true;
    this.callerTone.play();
  }

  stopAudio() {
    this.callerTone.pause();
    this.callerTone.src = '';
  }

  // Add/Remove class on full Screen mode
  exitHandler() {
    const element = this.document.getElementById(this.elementId);
    this.fullScreenMode = !this.fullScreenMode;
    this.fullScreenMode
      ? element.classList.add(this.elementId)
      : element.classList.remove(this.elementId);
  }

  // show hide video controls on mouse move in full screen mode
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e) {
    if (this.fullScreenMode === true) {
      const videoControls = document.querySelector('.auto-video-controls');
      videoControls.classList.add('show-controls');

      const interval = 2000;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        videoControls.classList.remove('show-controls');
      }, interval);
    }
  }

  micToggle() {
    this.micIcon = !this.micIcon;
  }
  videoToggle() {
    this.videoIcon = !this.videoIcon;
  }

  stopScreenShare() {
    this.screenPublisher.destroy();
    this.shareIcon = false;
    const presentingScreen = this.document.getElementById('presentingScreen');
    presentingScreen.classList.remove('show');
    this.opentokService
      .shareScreenLog('stop', this.callDetails.eventId)
      .subscribe();
  }

  record() {
    this.recording = !this.recording;
  }

  screenshare() {
    const publishOptions = {
      maxResolution: {width: 1920, height: 1080},
      videoSource: 'screen',
      fitmode: 'contain',
      publishAudio: false,
      showControls: false,
      name: `${this.store.getUser().firstName} ${
        this.store.getUser().lastName
      }`,
    };
    OT.checkScreenSharingCapability(response => {
      if (
        !response.supported ||
        response.extensionRegistered === false ||
        response.extensionInstalled === false
      ) {
        this.toasterService.info(
          'Your browser does not support screen sharing',
          'Not Supported',
          {
            timeOut: environment.messageTimeout,
          },
        );
      } else {
        const screenPublisherElement = document.createElement('div');
        this.renderer.appendChild(
          this.parentScreenPreview.nativeElement,
          screenPublisherElement,
        );
        this.screenPublisher = OT.initPublisher(
          screenPublisherElement,
          publishOptions,
          error => {
            if (error) {
              // error
            } else {
              if (this.screenSubs) {
                this.toasterService.warning(
                  'Another user is currently sharing their screen.',
                );
                return;
              }
              const presentingScreen = this.document.getElementById(
                'presentingScreen',
              );
              presentingScreen.classList.add('show');
              this.opentokService
                .shareScreenLog('start', this.callDetails.eventId)
                .subscribe();
              this.session.publish(this.screenPublisher, err => {
                this.shareIcon = true;
              });
            }
          },
        );
        this.screenPublisher.on('mediaStopped', event => {
          this.shareIcon = false;
          const stopPresenting = this.document.getElementById(
            'presentingScreen',
          );
          stopPresenting.classList.remove('show');
          this.opentokService
            .shareScreenLog('stop', this.callDetails.eventId)
            .subscribe();
        });
      }
    });
  }

  // check if Mobile devices
  mobileDevicesCheck() {
    const isMobile = {
      android: () => navigator.userAgent.match(/Android/i),
      blackBerry: () => navigator.userAgent.match(/BlackBerry/i),
      iOS: () => navigator.userAgent.match(/iPhone|iPad|iPod/i),
      opera: () => navigator.userAgent.match(/Opera Mini/i),
      windows: () =>
        navigator.userAgent.match(/IEMobile/i) ||
        navigator.userAgent.match(/WPDesktop/i),
      any: () => {
        return (
          isMobile.android() ||
          isMobile.blackBerry() ||
          isMobile.iOS() ||
          isMobile.opera() ||
          isMobile.windows()
        );
      },
    };

    if (isMobile.any()) {
      this.isMobileScreen = true;
    } else {
      this.isMobileScreen = false;
    }
  }

  openfullscreen() {
    // Trigger fullscreen
    const docElmWithBrowsersFullScreenFunctions = document.documentElement as HTMLElement & {
      mozRequestFullScreen(): Promise<void>;
      webkitRequestFullscreen(): Promise<void>;
      msRequestFullscreen(): Promise<void>;
      webkitEnterFullscreen(): Promise<void>;
    };

    if (docElmWithBrowsersFullScreenFunctions.requestFullscreen) {
      docElmWithBrowsersFullScreenFunctions.requestFullscreen();
    } else if (docElmWithBrowsersFullScreenFunctions.mozRequestFullScreen) {
      /* Firefox */
      docElmWithBrowsersFullScreenFunctions.mozRequestFullScreen();
    } else if (docElmWithBrowsersFullScreenFunctions.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      docElmWithBrowsersFullScreenFunctions.webkitRequestFullscreen();
    } else if (docElmWithBrowsersFullScreenFunctions.msRequestFullscreen) {
      /* IE/Edge */
      docElmWithBrowsersFullScreenFunctions.msRequestFullscreen();
    } else if (docElmWithBrowsersFullScreenFunctions.webkitEnterFullscreen) {
      // for iphone this code worked
      docElmWithBrowsersFullScreenFunctions.webkitEnterFullscreen();
    } else {
      // if not match
      docElmWithBrowsersFullScreenFunctions.requestFullscreen();
    }
  }

  closefullscreen() {
    const docWithBrowsersExitFunctions = document as Document & {
      mozCancelFullScreen(): Promise<void>;
      webkitExitFullscreen(): Promise<void>;
      msExitFullscreen(): Promise<void>;
    };
    if (docWithBrowsersExitFunctions.exitFullscreen) {
      docWithBrowsersExitFunctions.exitFullscreen();
    } else if (docWithBrowsersExitFunctions.mozCancelFullScreen) {
      /* Firefox */
      docWithBrowsersExitFunctions.mozCancelFullScreen();
    } else if (docWithBrowsersExitFunctions.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      docWithBrowsersExitFunctions.webkitExitFullscreen();
    } else if (docWithBrowsersExitFunctions.msExitFullscreen) {
      /* IE/Edge */
      docWithBrowsersExitFunctions.msExitFullscreen();
    } else {
      // if not match
      docWithBrowsersExitFunctions.exitFullscreen();
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.pubnub.removeListener(this.pubnubListner);
  }
}
