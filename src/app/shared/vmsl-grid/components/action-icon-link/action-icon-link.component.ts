import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {UserFacadeService} from '@vmsl/shared/facades/user-facade.service';

@Component({
  selector: 'vmsl-action-icon-link',
  templateUrl: './action-icon-link.component.html',
  styleUrls: ['./action-icon-link.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ActionIconLinkComponent implements OnInit {
  status: number;
  userId: string;
  permissionKey = Permission;
  userName: string;
  userLocked: boolean;
  teamNames: string[];
  constructor(
    private readonly router: Router,
    private readonly userFacade: UserFacadeService,
  ) {}

  ngOnInit(): void {}

  agInit(params): void {
    this.status = params.data.status;
    this.userId = params.data && params.data.id;
    this.userName = params.data && params.data.fullName;
    this.userLocked = params.data && params.data.locked;
    this.teamNames = params.data && params.data.teamNames;
  }

  onClickStatus(radioButton) {
    const inactiveStatus = 2;
    switch (radioButton) {
      case 1:
        this.userFacade.setUserStatus({status: 'active', id: this.userId});
        break;
      case inactiveStatus:
        this.userFacade.setUserStatus({status: 'inactive', id: this.userId});
        break;
      case 0:
        this.userFacade.setUserStatus({status: 'unverified', id: this.userId});
        break;
    }
  }

  edit() {
    this.router.navigate([`/main/user/edit/${this.userId}`]);
  }

  view() {
    this.router.navigate([`/main/profile/${this.userId}`]);
  }

  delete() {
    if (this.teamNames.length > 0) {
      this.userFacade.setUserToBeDeleted({
        userName: this.userName,
        id: this.userId,
        teamNames: this.teamNames,
      });
    } else {
      this.userFacade.setUserToBeDeleted({
        userName: this.userName,
        id: this.userId,
      });
    }
  }

  unlockUser() {
    this.userFacade.setUserIdToUnlock({
      userName: this.userName,
      id: this.userId,
    });
  }
}
