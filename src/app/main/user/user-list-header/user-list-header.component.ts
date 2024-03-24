import {Component} from '@angular/core';
import {UserFacadeService} from '@vmsl/shared/facades/user-facade.service';

@Component({
  selector: '.vmsl-user-list-header',
  templateUrl: './user-list-header.component.html',
  styleUrls: ['./user-list-header.component.scss'],
})
export class UserListHeaderComponent {
  displayName: string;
  sortIcon = 'fas fa-sort';
  constructor(private readonly userFacade: UserFacadeService) {}

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
    const columnName = this.setSortColumnName(this.displayName);
    this.userFacade.setUserListSort(`${columnName} ${sortType}`);
  }

  setSortColumnName(colName) {
    var displayName = '';
    if (colName === 'User Name') {
      displayName = 'fullName';
    } else {
      displayName = 'createdByName';
    }
    return displayName;
  }
}
