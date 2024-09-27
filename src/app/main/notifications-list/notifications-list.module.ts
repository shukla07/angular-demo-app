import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NotificationsListRoutingModule} from './notifications-list-routing.module';
import {NotificationsListComponent} from './notifications-list.component';
import {NotificationsListingFacadeService} from './shared/facades/notifications-listing-facade.service';
import {GetNotificationsListAdapter} from './shared/adapters/get-notifications-list-adapter.service';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {NgxPaginationModule} from 'ngx-pagination';
import {CalendarService} from '../calendar/calendar.service';
import {FlatpickrModule} from 'angularx-flatpickr';

@NgModule({
  declarations: [NotificationsListComponent],
  imports: [
    CommonModule,
    NotificationsListRoutingModule,
    ThemeModule,
    NgxPaginationModule,
    FlatpickrModule.forRoot(),
  ],
  providers: [
    NotificationsListingFacadeService,
    GetNotificationsListAdapter,
    CalendarService,
  ],
})
export class NotificationsListModule {}
