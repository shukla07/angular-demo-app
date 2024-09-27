import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  Input,
} from '@angular/core';
import * as OT from '@opentok/client';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {environment} from '@vmsl/env/environment';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-subscriber',
  templateUrl: './subscriber.component.html',
  styleUrls: ['./subscriber.component.scss'],
})
export class SubscriberComponent
  extends RouteComponentBase
  implements AfterViewInit {
  @ViewChild('subscriberDiv') subscriberDiv: ElementRef;
  @Input() session: OT.Session;
  @Input() stream: OT.Stream;
  subscriber: OT.Subscriber;
  mic = true;
  userSpeaking = false;
  userName: string;

  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly toasterService: ToastrService,
  ) {
    super(route, location);
  }

  ngAfterViewInit() {
    this.initSubscription();
    this.session.on('streamPropertyChanged', event => {
      if (
        event.changedProperty === 'hasAudio' &&
        event.stream['id'] === this.stream.streamId
      ) {
        this.mic = !this.mic;
      }
    });
  }

  initSubscription() {
    this.subscriber = this.session.subscribe(
      this.stream,
      this.subscriberDiv.nativeElement,
      {
        audioVolume: 60,
        width: '100%',
        height: '100%',
        style: {
          nameDisplayMode: 'off',
          buttonDisplayMode: 'off',
          audioLevelDisplayMode: 'off',
          backgroundImageURI: `${environment.baseUrl}/assets/avatar2.png`,
        },
      },
      err => {
        if (err && err.name !== 'OT_STREAM_NOT_FOUND' && err.name !=='OT_STREAM_DESTROYED' && err.name !== 'Error') {
          this.toasterService.error(err.message, 'Subscription failure', {
            timeOut: environment.messageTimeout,
          });
          this.initSubscription();
        }
        const name = this.stream.name.split(' ');
        this.subscriber.setStyle(
          'backgroundImageURI',
          `https://ui-avatars.com/api/?name=${name[0]}+${name[1]}=true&size=128`,
        );
        this.userName = this.stream.name;
        this.mic = this.stream.hasAudio;
        this.speakerDetection(
          this.subscriber,
          () => {
            this.userSpeaking = true;
          },
          () => {
            this.userSpeaking = false;
          },
        );
      },
    );
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
          activity = {timestamp: now, talking: false};
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

  ngOnDestroy() {
    super.ngOnDestroy();
    this.session.unsubscribe(this.subscriber);
  }
}
