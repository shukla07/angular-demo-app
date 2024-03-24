import {Component} from '@angular/core';
import {JobTitlesManagementService} from '../../../shared/facades/job-titles-management.service';

@Component({
  selector: 'vmsl-job-title-header',
  templateUrl: './job-title-header.component.html',
  styleUrls: ['./job-title-header.component.scss'],
})
export class JobTitleHeaderComponent {
  displayName: string;
  sortIcon = 'fas fa-sort';
  constructor(private readonly jobTitleFacade: JobTitlesManagementService) {}

  agInit(params) {
    this.displayName = params.displayName;
  }

  toggleIcon(sortType: string) {
    if (sortType === 'ASC') {
      this.sortIcon = 'fas fa-sort-up';
    } else if (sortType === 'DESC') {
      this.sortIcon = 'fas fa-sort-down';
    } else {
      this.sortIcon = 'fas fa-sort';
    }
    this.jobTitleFacade.setJobTitleSort({
      columnName: this.setSortColumnName(this.displayName),
      sort: sortType,
    });
  }

  setSortColumnName(colName) {
    var displayName = '';
    if (colName === 'Role') {
      displayName = 'jobTitle';
    } else {
      displayName = 'createdByName';
    }
    return displayName;
  }
}
