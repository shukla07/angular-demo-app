import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {HcpManagementService} from '../shared/facades/hcp-management.service';
import {Router} from '@angular/router';
import {UserInfo} from '@vmsl/core/auth/models/user.model';

@Component({
  selector: 'vmsl-hcp-action-icon',
  templateUrl: './hcp-action-icon.component.html',
  styleUrls: ['./hcp-action-icon.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HcpActionIconComponent implements OnInit {
  permissionKey = Permission;
  referralStatus: string;
  hcpId: string;
  hcpInfo: UserInfo;
  constructor(
    private readonly hcpManageService: HcpManagementService,
    private readonly router: Router,
  ) {}
  ngOnInit(): void {}

  agInit(params): void {
    this.referralStatus = params.data && params.data.referralStatus;
    this.hcpId = params.data && params.data.id;
    this.hcpInfo = params.data;
  }

  acceptRejectHcp(action) {
    this.hcpManageService.setResponseToRequest({
      action: action,
      id: this.hcpId,
    });
  }

  view() {
    this.hcpManageService.setHcpInfo(this.hcpInfo);
  }
}
