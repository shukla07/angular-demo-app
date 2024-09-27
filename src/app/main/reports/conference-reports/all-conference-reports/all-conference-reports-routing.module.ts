import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ConferenceReportsComponent} from './conference-reports.component';

const routes: Routes = [
  {
    path: '',
    component: ConferenceReportsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AllConferenceReportsRoutingModule {}
