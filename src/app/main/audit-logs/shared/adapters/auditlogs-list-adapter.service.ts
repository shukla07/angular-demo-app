import {Injectable} from '@angular/core';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {AuditLogs} from '../models/audit-logs.model';
import * as moment from 'moment';

@Injectable()
export class AuditLogsListAdapter implements IAdapter<AuditLogs> {
  adaptToModel(resp: any): AuditLogs {
    const auditLog = new AuditLogs();
    auditLog.after = resp.after;
    auditLog.before = resp.before;
    auditLog.id = resp.id;
    auditLog.logType = resp.logtype;
    auditLog.operationName = resp.operationname;
    auditLog.tenantId = resp.tenantid;
    auditLog.userId = resp.userid;
    auditLog.username = resp.username;
    auditLog.operationTime = moment(resp.operationtime).format('DD/MM/YYYY, HH:mm A');
    return auditLog;
  }
  adaptFromModel(data: any): any {
    return data;
  }
}
