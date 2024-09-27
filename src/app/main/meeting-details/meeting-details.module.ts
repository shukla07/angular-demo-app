import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '@vmsl/theme/theme.module';
import { MeetingDetailsComponent } from './meeting-details.component';
import { MeetingDetailsRoutingModule } from './meeting-details-routing.module';

@NgModule({
  declarations: [MeetingDetailsComponent],
  imports: [CommonModule, MeetingDetailsRoutingModule, ThemeModule.forRoot()],
})
export class MeetingDetailsModule {}
