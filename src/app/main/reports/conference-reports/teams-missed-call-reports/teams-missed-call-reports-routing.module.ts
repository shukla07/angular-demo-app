import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {TeamsMissedCallComponent} from './teams-missed-call.component';

const routes: Routes = [
  {
    path: '',
    component: TeamsMissedCallComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamsMissedCallReportsRoutingModule {}
