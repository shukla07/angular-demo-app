import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {MeetingComponent} from './meeting/meeting.component';

const routes: Routes = [
  {
    path: '',
    component: MeetingComponent,
  },
  {
    path: ':eventId',
    component: MeetingComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AudioVideoRoutingModule {}
