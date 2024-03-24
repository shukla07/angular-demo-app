import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MainComponent} from './main.component';
import {MainRoutingModule} from './main-routing.module';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {SharedModule} from '@vmsl/shared/shared.module';
import {AudioVideoModule} from './audio-video/audio-video.module';
import {NgIdleKeepaliveModule} from '@ng-idle/keepalive';
import {CalendarModule} from './calendar/calendar.module';
import {NgxPermissionsModule} from 'ngx-permissions';
import {MAModule} from './ma/ma.module';
import { ChatModule } from './chat/chat.module';

@NgModule({
  declarations: [MainComponent],
  imports: [
    CommonModule,
    MainRoutingModule,
    ThemeModule.forRoot(),
    SharedModule,
    AudioVideoModule,
    NgxPermissionsModule.forChild(),
    NgIdleKeepaliveModule.forRoot(),
    CalendarModule,
    MAModule,
    ChatModule
  ],
  providers: [],
})
export class MainModule {}
