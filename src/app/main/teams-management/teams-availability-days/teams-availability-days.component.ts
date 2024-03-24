import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'vmsl-teams-availability-days',
  templateUrl: './teams-availability-days.component.html',
  styleUrls: ['./teams-availability-days.component.scss'],
})
export class TeamsAvailabilityDaysComponent implements OnInit {
  availabilityDay: string[];

  constructor() {}

  agInit(params): void {
    this.availabilityDay = params.data.availabilityDays;
  }

  ngOnInit(): void {}
}
