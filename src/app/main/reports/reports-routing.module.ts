import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

const routes: Routes = [
  {
    path: 'all-conference',
    loadChildren: () =>
      import(
        './conference-reports/all-conference-reports/all-conference-reports.module'
      ).then(m => m.AllConferenceReportsModule),
  },
  {
    path: 'no-show',
    loadChildren: () =>
      import(
        './conference-reports/no-show-reports/no-show-reports.module'
      ).then(m => m.NoShowReportsModule),
  },
  {
    path: 'team-missed-call',
    loadChildren: () =>
      import(
        './conference-reports/teams-missed-call-reports/teams-missed-call-reports.module'
      ).then(m => m.TeamsMissedCallReportsModule),
  },
  {
    path: 'mod',
    loadChildren: () =>
      import('./conference-reports/mod-reports/mod-reports.module').then(
        m => m.ModReportsModule,
      ),
  },
  {
    path: 'mod-metric',
    loadChildren: () =>
      import(
        './conference-reports/mod-metric-report/mod-metric-report-routing.module'
      ).then(m => m.ModMetricReportRoutingModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
