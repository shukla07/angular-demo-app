import {Component, OnInit} from '@angular/core';
import {UserFacadeService} from '@vmsl/shared/facades/user-facade.service';

@Component({
  selector: '.vmsl-column-sorting-header',
  templateUrl: './column-sorting-header.component.html',
  styleUrls: ['./column-sorting-header.component.scss'],
})
export class ColumnSortingHeaderComponent implements OnInit {
  displayName: string;
  sortIcon = 'fas fa-sort';
  constructor(private readonly userFacadeService: UserFacadeService) {}

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
    this.userFacadeService.setNameColumnSort({
      columnName: 'name',
      sort: sortType,
    });
  }
}
