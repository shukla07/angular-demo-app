import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AddressBookComponent} from './address-book.component';
import {RequestMeetingComponent} from './request-meeting/request-meeting.component';
import {AddressBookRoutingModule} from './address-book-routing.module';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {NgxPaginationModule} from 'ngx-pagination';
import {FilterPipeModule} from 'ngx-filter-pipe';
import {FlatpickrModule} from 'angularx-flatpickr';
// sonarignore:start
import {DateTimePickerModule} from '@syncfusion/ej2-angular-calendars';
import { NgxPermissionsModule } from 'ngx-permissions';
// sonarignore:end

@NgModule({
  declarations: [AddressBookComponent, RequestMeetingComponent],
  imports: [
    CommonModule,
    AddressBookRoutingModule,
    DateTimePickerModule,
    ThemeModule.forRoot(),
    NgxPaginationModule,
    FilterPipeModule,
    FlatpickrModule.forRoot(),
    NgxPermissionsModule.forChild(),
  ],
})
export class AddressBookModule {}
