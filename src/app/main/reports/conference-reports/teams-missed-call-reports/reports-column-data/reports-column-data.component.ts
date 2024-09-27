import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'vmsl-reports-column-data',
  templateUrl: './reports-column-data.component.html',
  styleUrls: ['./reports-column-data.component.scss'],
})
export class ReportsColumnDataComponent implements OnInit {
  columnData: string;
  constructor() {}

  ngOnInit(): void {}

  agInit(params) {
    this.columnData = `${params.data.firstName} ${params.data.lastName}`;
  }
}
