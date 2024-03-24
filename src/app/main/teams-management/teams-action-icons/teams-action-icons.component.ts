import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {Router} from '@angular/router';
import {TeamsManagementService} from '../shared/teams-management.service';

@Component({
  selector: 'vmsl-teams-action-icons',
  templateUrl: './teams-action-icons.component.html',
  styleUrls: ['./teams-action-icons.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TeamsActionIconsComponent implements OnInit {
  status: number;
  teamId: string;
  permissionKey = Permission;
  teamName: string;

  constructor(
    private readonly router: Router,
    private readonly teamManagementService: TeamsManagementService,
  ) {}

  ngOnInit(): void {}

  agInit(params): void {
    this.status = params.data.status;
    this.teamId = params.data && params.data.teamId;
    this.teamName = params.data && params.data.teamName;
  }

  onClickStatus(radioButton) {
    this.teamManagementService.setTeamStatus({
      status: radioButton,
      id: this.teamId,
    });
  }

  edit() {
    this.router.navigate([`/main/teams-management/edit/${this.teamId}`]);
  }

  view() {
    this.router.navigate([`/main/teams-management/profile/${this.teamId}`]);
  }

  delete() {
    this.teamManagementService.setTeamToBeDeleted({
      teamName: this.teamName,
      id: this.teamId,
    });
  }
}
