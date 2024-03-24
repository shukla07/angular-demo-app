import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AudioVideoComponent} from './audio-video.component';
import {PublisherComponent} from './publisher/publisher.component';
import {SubscriberComponent} from './subscriber/subscriber.component';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {CarouselModule} from 'ngx-owl-carousel-o';
import {OpentokService} from './shared/opentok.service';
import {UserNameAdapter} from './shared/adapters/user-name-adapter.service';
import {AudioVideoRoutingModule} from './audio-video-routing.module';
import {MeetingComponent} from './meeting/meeting.component';
import {CountdownModule} from 'ngx-countdown';
import {NgxPermissionsModule} from 'ngx-permissions';
import {CallAdapter} from './shared/adapters/call-adapter.service';
import {TeamAdhocCallAdapter} from './shared/adapters/team-adhoc-call-adapter.service';

@NgModule({
  declarations: [
    AudioVideoComponent,
    PublisherComponent,
    SubscriberComponent,
    MeetingComponent,
  ],
  imports: [
    CommonModule,
    ThemeModule.forRoot(),
    CarouselModule,
    AudioVideoRoutingModule,
    CountdownModule,
    NgxPermissionsModule.forChild(),
  ],
  providers: [
    OpentokService,
    UserNameAdapter,
    CallAdapter,
    TeamAdhocCallAdapter,
  ],
  exports: [AudioVideoComponent],
})
export class AudioVideoModule {}
