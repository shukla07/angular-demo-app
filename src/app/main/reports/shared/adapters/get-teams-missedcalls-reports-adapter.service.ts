import {Injectable} from '@angular/core';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Report} from '../models/report-model';
import * as moment from 'moment';

@Injectable()
export class TeamsMissedCallsReportListAdapter implements IAdapter<Report> {
  adaptToModel(resp: any): Report {
    if (resp) {
      const report = new Report();
      report.eventName = resp.summary;
      report.teamName =
        resp.teamName === 'N.A.'
          ? resp.teamName
          : resp.teamName[0].toUpperCase() +
            resp.teamName.substr(1).toLowerCase();
      report.callType =
        resp.callType[0].toUpperCase() + resp.callType.substr(1).toLowerCase();
      report.startDateTime = moment
        .parseZone(resp.startDateTime)
        .local()
        .format('MM/DD/YY, hh:mm A');
      report.id = resp.eventId;
      report.users = JSON.parse(resp.mslsRequested);
      return report;
    }
    return resp;
  }
  adaptFromModel(data: Partial<Report>) {
    return data;
  }
}
