import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SchedulerInterfaceModule} from '@sourcefuse/ngx-scheduler';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {CountdownModule} from 'ngx-countdown';
import {NgxPermissionsModule} from 'ngx-permissions';
import {NgSelectModule} from '@ng-select/ng-select';
import {ChatListingComponent} from './chat-listing/chat-listing.component';
import {ChatWindowsComponent} from './chat-windows/chat-windows.component';
import {ChatFacadeService} from './shared/chat-facade.service';
import {MessageAdapter} from './shared/adapters/message-adapter.service';
import {GetChatAdapter} from './shared/adapters/get-chat-adapter.service';
import {GetMessages} from './shared/adapters/get-messages-adapter.service';
import {FilterPipeModule} from 'ngx-filter-pipe';
import {FlatpickrModule} from 'angularx-flatpickr';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';

@NgModule({
  declarations: [ChatWindowsComponent, ChatListingComponent],
  imports: [
    CommonModule,
    ThemeModule.forRoot(),
    CountdownModule,
    NgxPermissionsModule.forChild(),
    SchedulerInterfaceModule,
    NgSelectModule,
    FilterPipeModule,
    FlatpickrModule.forRoot(),
    InfiniteScrollModule,
    NgxPermissionsModule.forChild(),
  ],
  exports: [ChatWindowsComponent, ChatListingComponent],
  providers: [ChatFacadeService, MessageAdapter, GetChatAdapter, GetMessages],
})
export class ChatModule {}
