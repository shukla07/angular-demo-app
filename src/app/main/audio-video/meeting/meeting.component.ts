import {Component, ViewChild, ViewEncapsulation, Inject} from '@angular/core';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {ActivatedRoute} from '@angular/router';
import {Location, DOCUMENT} from '@angular/common';
import {NbDialogService} from '@nebular/theme';
import {AudioVideoComponent} from '../audio-video.component';
import {environment} from '@vmsl/env/environment';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {OpentokService} from '../shared/opentok.service';
import {CountdownComponent} from 'ngx-countdown';
import {PubNubAngular} from 'pubnub-angular2';
import {ToastrService} from 'ngx-toastr';
import * as moment from 'moment';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {PubnubService} from '@vmsl/shared/facades/pubnub.service';
import {RoleType} from '../../../core/enums/roles.enum';

@Component({
  selector: 'vmsl-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MeetingComponent extends RouteComponentBase {
  @ViewChild('countDown', {static: false}) countdown: CountdownComponent;
  eventId: string;
  timeleft: number;
  countdownConfig: Object;
  meetingDetails;
  userChannel: string;
  showJoinButton = false;
  buttonText = 'Join Meeting';
  currentDateTime = moment().format('h:mm A');
  isOwner: boolean;
  showRejoinButton = false;
  stateChange = 'state-change';
  pubnubListner: object;

  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly dialogService: NbDialogService,
    private readonly store: UserSessionStoreService,
    private readonly opentokService: OpentokService,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly pubnub: PubNubAngular,
    private readonly toasterService: ToastrService,
    private readonly ngxService: NgxUiLoaderService,
    private readonly pubnubService: PubnubService,
  ) {
    super(route, location);
    this.userChannel = `${this.store.getUser().id}_${
      this.store.getUser().tenantId
    }`;
    // sonarignore:start
    window.addEventListener('beforeunload', e => {
      if (this.document.baseURI !== environment.baseUrl) {
        return;
      }

      this.store.removeCallTab();
    });
    // sonarignore:end
    this.ngxService.start();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.callPubnubListener();
  }

  ngAfterViewInit() {
    this.eventId = this.getRouteParam('eventId');
    if (this.eventId) {
      this.getMeetingDetails();
    } else {
      this.ngxService.stop();
      this.dialogService.open(AudioVideoComponent, {
        closeOnBackdropClick: false,
        closeOnEsc: false,
      });
    }
  }

  meetingStatusUpdate() {
    const minSub = 5;
    const timeInterval = 60000;

    setInterval(() => {
      this.currentDateTime = moment().format('h:mm A');
      const beforeEndDateTime = moment(this.meetingDetails.endDateTime)
        .subtract(minSub, 'm')
        .format('h:mm A');
      const endDateTime = moment(this.meetingDetails.endDateTime).format(
        'h:mm A',
      );
      if (this.currentDateTime === beforeEndDateTime && this.isOwner) {
        this.toasterService.warning(
          `Your current call is scheduled to end at ${endDateTime}`,
          'REMINDER',
        );
      }
      if (this.currentDateTime === endDateTime && this.isOwner) {
        this.toasterService.warning(
          `Your current call has exceeded the scheduled end time ${endDateTime}`,
          'ALERT',
        );
      }
    }, timeInterval);
  }

  callPubnubListener() {
    this.pubnubListner = {
      presence: e => {
        if (
          e.uuid === this.store.getUser().id &&
          e.action === this.stateChange &&
          e.state?.status === 'Busy'
        ) {
          this.showRejoinButton = true;
        }
        if (
          e.uuid === this.store.getUser().id &&
          e.action === this.stateChange &&
          e.state?.status !== 'Busy'
        ) {
          this.showRejoinButton = false;
        }
      },
      message: m => {
        const data = JSON.parse(m.message);
        switch (data.notificationData?.callStatus) {
          case 'ownerConnected':
            this.showJoinButton = true;
            break;
          case 'ownerDisconnected':
            this.showJoinButton = false;
            this.showRejoinButton = false;
            break;
          case 'MissedCall':
          case 'DisconnectedCall':
            this.showRejoinButton = false;
            break;
        }
      },
    };
    this.pubnub.addListener(this.pubnubListner);
  }

  joinMeeting() {
    this.opentokService.joinMeeting(this.eventId).subscribe(
      res => {
        this.isOwner = res['isOwner'];
        if (parseInt(this.store.getUser().role) === RoleType.jrHcp) {
          this.showJoinButton = false;
        }
        this.ngxService.stop();
        if (res.sessionId) {
          this.connectToMeeting(res);
          this.showJoinButton = true;
        } else {
          if (res['remainingTime'] > 0) {
            this.startTimer(res);
          }
        }
        if (this.isOwner) {
          this.meetingStatusUpdate();
        }
      },
      err => {
        this.ngxService.stop();
        this.showJoinButton = false;
      },
    );
  }

  connectToMeeting(callData) {
    const meetingDetails = {
      sessionId: callData.sessionId,
      token: callData.token,
      apiKey: callData.apiKey,
      eventId: this.eventId,
      mediaType: this.meetingDetails.extMetadata?.meetingInfo?.type,
    };
    this.store.setCallData(meetingDetails);
    this.store.setCallConnected(true);
    this.meetingDetails = null;
    this.dialogService.open(AudioVideoComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }

  getMeetingDetails() {
    this.opentokService.getMeetingDetails(this.eventId).subscribe(res => {
      this.meetingDetails = res[0];
      this.joinMeeting();
    });
  }

  startTimer(timeLeft) {
    const divider = 1000;
    this.timeleft = timeLeft.remainingTime / divider;
    this.countdownConfig = {
      leftTime: this.timeleft,
      format: 'mm:ss',
    };
  }

  stopTimer(event) {
    if (event.left === 0) {
      this.timeleft = null;
    }
  }

  rejoin() {
    const timeout = 30000;
    this.store.setCallTab(true);
    setTimeout(() => {
      this.pubnubService.removeCallTabIfNotBusy();
    }, timeout);
    window.location.reload();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.pubnub.removeListener(this.pubnubListner);
  }
}
