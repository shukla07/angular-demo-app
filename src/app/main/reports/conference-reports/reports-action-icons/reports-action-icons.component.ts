import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ReportsService} from '../../shared/reports.service';

@Component({
  selector: 'vmsl-reports-action-icons',
  templateUrl: './reports-action-icons.component.html',
  styleUrls: ['./reports-action-icons.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ReportsActionIconsComponent implements OnInit {
  reportData: Object;
  location: string;
  constructor(private readonly reportService: ReportsService) {}

  ngOnInit(): void {
    this.location = window.location.pathname;
  }

  agInit(params): void {
    this.reportData = params.data;
  }

  viewReport() {
    switch (this.location) {
      case '/main/reports/team-missed-call':
        this.reportService.setRequestedUsers(this.reportData['users']);
        break;
      case '/main/reports/no-show':
        this.reportService.setNoShowEvents(this.reportData['events']);
        break;
      case '/main/reports/all-conference':
        this.reportService.setReportInfo(this.reportData);
        break;
      case '/main/reports/mod':
        this.reportService.setModReportsInfo(this.reportData);
        break;
    }
  }
}
