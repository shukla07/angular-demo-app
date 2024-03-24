import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {PrintMailRoutingModule} from './print-mail-routing.module';
import {PrintMailComponent} from './print-mail.component';
import {PrintService} from './print-mail.service';
import {ContactListAdapter} from '@vmsl/shared/adapters/contact-list-adapter.service';
import {GetMailByIdAdapter} from '../main/mailbox/shared/adapters/get-mail-by-id-adapter.service';

@NgModule({
  declarations: [PrintMailComponent],
  imports: [CommonModule, PrintMailRoutingModule, ThemeModule.forRoot()],
  providers: [PrintService, GetMailByIdAdapter, ContactListAdapter],
})
export class PrintMailModule {}
