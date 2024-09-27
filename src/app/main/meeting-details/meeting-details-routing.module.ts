import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { MeetingDetailsComponent } from './meeting-details.component';

const routes: Routes = [
  {
    path: '',
    component: MeetingDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MeetingDetailsRoutingModule {}
