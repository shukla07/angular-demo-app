import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ModMetricReportComponent} from './mod-metric-report.component';

const routes: Routes = [
  {
    path: '',
    component: ModMetricReportComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModMetricReportRoutingModule {}
