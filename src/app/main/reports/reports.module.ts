import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ReportsRoutingModule} from './reports-routing.module';
import {ReportsService} from './shared/reports.service';
import {SharedModule} from '@vmsl/shared/shared.module';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {NgxPermissionsModule} from 'ngx-permissions';
import {FlatpickrModule} from 'angularx-flatpickr';
import {NgxPaginationModule} from 'ngx-pagination';
import {ReportListAdapter} from './shared/adapters/get-report-list-adapter.service';
import {TeamsMissedCallsReportListAdapter} from './shared/adapters/get-teams-missedcalls-reports-adapter.service';
import {NoShowReportListAdapter} from './shared/adapters/get-noshow-report-list-adapter.service';
import {ConferenceReportsComponent} from './conference-reports/all-conference-reports/conference-reports.component';
import {ReportsActionIconsComponent} from './conference-reports/reports-action-icons/reports-action-icons.component';
import {NoShowReportsComponent} from './conference-reports/no-show-reports/no-show-reports.component';
import {TeamsMissedCallComponent} from './conference-reports/teams-missed-call-reports/teams-missed-call.component';
import {ReportsColumnDataComponent} from './conference-reports/teams-missed-call-reports/reports-column-data/reports-column-data.component';
import {GetLinkedUserAdapter} from '@vmsl/shared/adapters/get-linked-users-adapter.service';
import {ReportsListHeaderComponent} from './conference-reports/reports-list-header/reports-list-header.component';
import {ModReportsComponent} from './conference-reports/mod-reports/mod-reports.component';
import {ModReportListAdapter} from './shared/adapters/get-mod-report-list-adapter.service';
import {ModMetricReportComponent} from './conference-reports/mod-metric-report/mod-metric-report.component';
import {ModMetricReportListAdapter} from './shared/adapters/get-mod-metric-report-list-adapter.service';

@NgModule({
  declarations: [
    ConferenceReportsComponent,
    ReportsActionIconsComponent,
    NoShowReportsComponent,
    TeamsMissedCallComponent,
    ReportsColumnDataComponent,
    ReportsListHeaderComponent,
    ModReportsComponent,
    ModMetricReportComponent,
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    SharedModule,
    ThemeModule.forRoot(),
    NgxPermissionsModule.forChild(),
    FlatpickrModule.forRoot(),
    NgxPaginationModule,
  ],
  providers: [
    ReportsService,
    ReportListAdapter,
    GetLinkedUserAdapter,
    TeamsMissedCallsReportListAdapter,
    NoShowReportListAdapter,
    ModReportListAdapter,
    ModMetricReportListAdapter,
  ],
})
export class ReportsModule {}
