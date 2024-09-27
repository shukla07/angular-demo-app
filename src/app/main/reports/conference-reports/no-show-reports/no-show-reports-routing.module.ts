import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {NoShowReportsComponent} from './no-show-reports.component';

const routes: Routes = [
  {
    path: '',
    component: NoShowReportsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NoShowReportsRoutingModule {}
