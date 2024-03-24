import {Component} from '@angular/core';
import {ContentManagementService} from '../../../shared/facades/content-management.service';

@Component({
  selector: 'vmsl-content-header',
  templateUrl: './content-header.component.html',
  styleUrls: ['./content-header.component.scss'],
})
export class ContentHeaderComponent {
  displayName: string;
  sortIcon = 'fas fa-sort';
  constructor(private readonly contentFacade: ContentManagementService) {}

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
    this.contentFacade.setContentSort({
      columnName: this.setSortColumnName(this.displayName),
      sort: sortType,
    });
  }

  setSortColumnName(colName) {
    var displayName = '';
    if (colName === 'Content Name') {
      displayName = 'title';
    } else {
      displayName = 'createdByName';
    }
    return displayName;
  }
}
