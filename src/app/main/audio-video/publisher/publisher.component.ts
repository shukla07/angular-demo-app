import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  Input,
  TemplateRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { OpentokService } from '../shared/opentok.service';
import { UserSessionStoreService } from '@vmsl/core/store/user-session-store.service';
import { RouteComponentBase } from '@vmsl/core/route-component-base';
import { environment } from '@vmsl/env/environment';
import { ToastrService } from 'ngx-toastr';
import { NbDialogModule, NbDialogService } from '@nebular/theme';
import { STATUS_CODE } from '@vmsl/core/api/error-code';
import { deviceIncompatible } from '../../../../assets/message/notification';

@Component({
  selector: 'app-publisher',
  templateUrl: './publisher.component.html',
  styleUrls: ['./publisher.component.scss'],
})
export class PublisherComponent
  extends RouteComponentBase
  implements AfterViewInit {
  @ViewChild('dialog', { read: TemplateRef }) dialog: TemplateRef<NbDialogModule>;
  @ViewChild('publisherDiv') publisherDiv: ElementRef;
  @Output('disconnect') disconnect = new EventEmitter();
  @Input('session') session: OT.Session;
  @Input('call-type') callType: string;
  @Input('screen-share') screenSharing: boolean;
  @Input('recording') recording: boolean;
  @Input('videoDevices') videoDevices: string[];
  @Input('mic')
  public set mic(value: boolean) {
    if (this.publisher) {
      this.micIcon = value;
      this.publisher.publishAudio(value);
    }
  }
  @Input('video')
  public set video(value: boolean) {
    if (this.publisher) {
      this.publisher.publishVideo(value);
    }
  }
  @Input('facingMode')
  public set facingMode(value) {
    if (this.publisher) {
      this.switchCamera(value);
    }
  }
  publisher: OT.Publisher;
  publishing: boolean;
  micIcon = true;
  userName: string;
  userSpeaking = false;
  publishingFailed = 'Publishing Failed';
  constructor(
    private readonly opentokService: OpentokService,
    private readonly store: UserSessionStoreService,
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly toasterService: ToastrService,
    private readonly dialogService: NbDialogService,
  ) {
    super(route, location);
    this.publishing = false;
    this.userName = this.store
      .getUser()
      .firstName.concat(` ${this.store.getUser().lastName}`);
  }

  ngAfterViewInit() {
    this.initPublisher(true, this.videoDevices[0]);
  }

  initPublisher(mirror: boolean, videoSource: string) {
    const OT = this.opentokService.getOT();
    const name = this.userName.split(' ');
    this.publisher = OT.initPublisher(
      this.publisherDiv.nativeElement,
      {
        videoSource: videoSource,
        mirror: mirror,
        insertMode: 'append',
        width: '100%',
        height: '100%',
        name: this.userName,
        style: {
          nameDisplayMode: 'off',
          buttonDisplayMode: 'off',
          audioLevelDisplayMode: 'off',
          backgroundImageURI: `https://ui-avatars.com/api/?name=${name[0]}+${name[1]}=true&size=128`,
        },
        publishVideo: this.callType === 'video' ? true : false,
      },
      error => {
        if (error) {
          this.errorHandling(error);
        } else {
          if (this.session['isConnected']()) {
            this.publish();
          }
          this.session.on('sessionConnected', () => {
            this.publish();
          });

          this.speakerDetection(
            this.publisher,
            () => {
              this.userSpeaking = true;
            },
            () => {
              this.userSpeaking = false;
            },
          );
        }
      },
    );
  }

  errorHandling(error) {
    if (
      error['code'] === STATUS_CODE.OT_UNABLE_TO_CAPTURE_MEDIA &&
      (error.name === 'OT_UNABLE_TO_CAPTURE_MEDIA' || error.name === 'OT_HARDWARE_UNAVAILABLE')
    ) {
      this.publisher.destroy();
      this.openErrorDialog(
        'The selected voice or video devices are unavailable. Please verify they are not in use by another application and try again.',
      );
    } else if (
      error['code'] === STATUS_CODE.OT_UNABLE_TO_CAPTURE_MEDIA &&
      (error.name === 'OT_CONSTRAINTS_NOT_SATISFIED' ||
        error.name === 'OT_USER_MEDIA_ACCESS_DENIED')
    ) {
      this.publisher.destroy();
      this.openErrorDialog(
        'Please allow browser to access camera and microphone, then refresh the browser.',
      );
    } else if (
      error['code'] === STATUS_CODE.OT_UNABLE_TO_CAPTURE_MEDIA &&
      error.name === 'OT_NOT_SUPPORTED'
    ) {
      this.disconnect.emit();
      this.toasterService.error(deviceIncompatible, 'Incompatible Browser', {
        timeOut: environment.messageTimeout,
      });
    } else {
      this.disconnect.emit();
      this.toasterService.error(`${error.message}`, this.publishingFailed, {
        timeOut: environment.messageTimeout,
      });
    }
  }

  openErrorDialog(message: string) {
    this.dialogService.open(this.dialog, {
      closeOnBackdropClick: true,
      context: {
        message,
      },
    });
  }

  publish() {
    this.session.publish(this.publisher, err => {
      if (err) {
        this.disconnect.emit();
        switch (err.name) {
          case 'OT_NOT_CONNECTED':
            this.toasterService.error(
              'Please check your internet connection and try again.',
              this.publishingFailed,
              {
                timeOut: environment.messageTimeout,
              },
            );
            break;
          case 'OT_CREATE_PEER_CONNECTION_FAILED':
          default:
            this.toasterService.error(
              'An error has occurred. Please try again.',
              this.publishingFailed,
              {
                timeOut: environment.messageTimeout,
              },
            );
            break;
        }
      } else {
        this.publishing = true;
      }
    });
  }

  speakerDetection(publisher, startTalking, stopTalking) {
    const num1 = 0.2;
    const num2 = 100;
    const num3 = 1000;
    let activity = null;
    publisher.on('audioLevelUpdated', event => {
      const now = Date.now();
      if (event.audioLevel > num1) {
        if (!activity) {
          activity = { timestamp: now, talking: false };
        } else if (activity.talking) {
          activity.timestamp = now;
        } else if (
          now - activity.timestamp > num2 &&
          typeof startTalking === 'function'
        ) {
          activity.talking = true;
          startTalking();
        } else {
          // Empty else block
        }
      } else if (activity && now - activity.timestamp > num3) {
        if (activity.talking && typeof stopTalking === 'function') {
          stopTalking();
        }
        activity = null;
      } else {
        // Empty else block
      }
    });
  }

  switchCamera(value) {
    this.publisher.destroy();
    if (value) {
      this.initPublisher(false, this.videoDevices[1]);
    } else {
      this.initPublisher(true, this.videoDevices[0]);
    }
    this.publisher.publishVideo(true);
  }

  retry() {
    window.location.reload();
  }
}
