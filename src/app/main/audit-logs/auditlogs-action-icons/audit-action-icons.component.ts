import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Permission } from '@vmsl/core/auth/permission-key.enum';
import { AuditLogsService } from '../shared/audit-logs.service';

@Component({
  selector: 'vmsl-audit-action-icons',
  templateUrl: './audit-action-icons.component.html',
  styleUrls: ['./audit-action-icons.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AuditActionIconsComponent implements OnInit {
  userId: string;
  permissionKey = Permission;
  dataBefore: string;
  dataAfter: string;
  operationName: string;
  hideDiff = false;
  operationTime: string;
  logType: string;
  username: string;

  constructor(private readonly auditService: AuditLogsService) { }

  ngOnInit(): void { }

  agInit(params): void {
    this.userId = params.data && params.data.userId;
    this.username = params.data && params.data.username;
    this.dataBefore = params.data && params.data.before;
    this.dataAfter = params.data && params.data.after;
    this.operationName = params.data && params.data.operationName;
    this.operationTime = params.data && params.data.operationTime;
    this.logType = params.data && params.data.logType;
    if (
      this.operationName === 'LOGIN' ||
      this.operationName === 'LOGOUT' ||
      this.operationName === 'PASSWORD-CHANGE'
    ) {
      this.hideDiff = true;
    }
  }

  viewOperator() {
    this.auditService.setUserTenantId(this.userId);
  }

  viewChanges() {
    this.auditService.setChangesFromLogs({
      before: this.dataBefore,
      after: this.dataAfter,
      operationName: this.operationName,
      logType: this.logType,
      username: this.username
    });
  }

  viewOperationTime() {
    this.auditService.setOperationTime({ userId: this.userId, operationTime: this.operationTime });
  }
}
