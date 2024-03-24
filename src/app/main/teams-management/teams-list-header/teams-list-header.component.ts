import {Component} from '@angular/core';
import {TeamsManagementService} from '../shared/teams-management.service';

@Component({
  selector: 'vmsl-teams-list-header',
  templateUrl: './teams-list-header.component.html',
  styleUrls: ['./teams-list-header.component.scss'],
})
export class TeamsListHeaderComponent {
  displayName: string;
  sortIcon = 'fas fa-sort';
  constructor(private readonly teamsFacade: TeamsManagementService) {}

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
    this.teamsFacade.setTeamsListSort({
      columnName: this.setSortColumnName(this.displayName),
      sort: sortType,
    });
  }

  setSortColumnName(colName) {
    var displayName = '';
    if (colName === 'Team Name') {
      displayName = 'teamName';
    } else {
      displayName = 'createdByName';
    }
    return displayName;
  }
}
