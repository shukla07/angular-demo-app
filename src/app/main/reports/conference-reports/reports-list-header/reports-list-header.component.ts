import {Component, OnInit} from '@angular/core';
import {ReportsService} from '../../shared/reports.service';

@Component({
  selector: '.vmsl-reports-list-header',
  templateUrl: './reports-list-header.component.html',
  styleUrls: ['./reports-list-header.component.scss'],
})
export class ReportsListHeaderComponent implements OnInit {
  displayName: string;
  sortIcon = 'fas fa-sort';
  sortType: string;
  constructor(private readonly reportsService: ReportsService) {}

  agInit(params) {
    this.displayName = params.displayName;
  }

  ngOnInit(): void {}

  toggleIcon(sortType: string) {
    if (sortType === 'ASC') {
      this.sortIcon = 'fas fa-sort-up';
    } else if (sortType === 'DESC') {
      this.sortIcon = 'fas fa-sort-down';
    } else {
      this.sortIcon = 'fas fa-sort';
    }
    this.sortType = sortType;
    this.setSortColumnName(this.displayName);
  }

  setSortColumnName(colName) {
    var displayName = '';
    switch (colName) {
      case 'Start Date Time':
        this.reportsService.setAllMeetingstSort({
          columnName: 'et.start_datetime',
          sort: this.sortType,
        });
        break;
      case 'Duration':
        this.reportsService.setAllMeetingstSort({
          columnName: 'duration',
          sort: this.sortType,
        });
        break;
      case 'User Name':
        this.reportsService.setNoShowMeetingstSort({
          columnName: 'name',
          sort: this.sortType,
        });
        break;
      case 'Count of No Show':
        this.reportsService.setNoShowMeetingstSort({
          columnName: 'count',
          sort: this.sortType,
        });
        break;
      case 'Team Name':
        this.reportsService.setTeamMissedMeetingstSort({
          columnName: 'teamName',
          sort: this.sortType,
        });
        break;
      case 'Date & Time':
        this.reportsService.setTeamMissedMeetingstSort({
          columnName: 'et.start_datetime',
          sort: this.sortType,
        });
        break;
      case 'Requestor Name':
        this.reportsService.setModReportsSort({
          columnName: 'requestor',
          sort: this.sortType,
        });
        break;
      case 'Request Sent Date':
        this.reportsService.setModReportsSort({
          columnName: 'requestSentDate',
          sort: this.sortType,
        });
        break;
    }
    return displayName;
  }
}
