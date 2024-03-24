import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {ModReports, ModUsers} from '../models/mod-reports-model';
import * as moment from 'moment';

@Injectable()
export class ModReportListAdapter implements IAdapter<ModReports> {
  adaptToModel(resp: any): ModReports {
    const report = new ModReports();
    const dateFormat = 'DD/MM/YYYY, HH:mm A';
    report.diseaseArea =
      resp.diseaseArea &&
      resp.diseaseArea !== '' &&
      resp.diseaseArea.split(',');
    report.duration = resp.duration;
    report.endDateTime =
      resp.endDateTime && moment(resp.endDateTime).format(dateFormat);
    report.hcpOrPayorName = resp.hcpOrPayorName;
    report.jobTitle =
      resp.jobTitle && resp.jobTitle !== '' && resp.jobTitle.split(',');
    report.linkedEventId = resp.linkedModEventId;
    report.eventId = resp.modEventId;
    report.modUsersReports = this.getModUsers(resp);
    report.presetQuestions =
      resp.pretextQuestions && resp.pretextQuestions.split(',');
    report.requestAcceptedDate =
      resp.requestAcceptedDate &&
      moment(resp.requestAcceptedDate).format(dateFormat);
    report.requestSentDate =
      resp.requestSentDate && moment(resp.requestSentDate).format(dateFormat);
    report.requestTimeout =
      resp.requestTimeout && moment(resp.requestTimeout).format(dateFormat);
    report.requestedTeams = resp.requestedTeams;
    report.requestorName = resp.requestor;
    report.requestorId = resp.requestorId;
    report.territory =
      resp.territory && resp.territory !== '' && resp.territory.split(',');
    report.therapeuticArea =
      resp.therapeuticArea &&
      resp.therapeuticArea !== '' &&
      resp.therapeuticArea.split(',');
    return report;
  }
  adaptFromModel(data: Partial<ModReports>) {
    return data;
  }

  getModUsers(userInfo: ModReports) {
    const modUsers = [];
    const dateFormat = 'DD/MM/YYYY, HH:mm A';
    userInfo.modUsersReports.forEach(user => {
      const modUser = new ModUsers();
      modUser.actionDateTime =
        user['actionDatetime'] &&
        moment(user['actionDatetime']).format(dateFormat);
      modUser.requestAction = user.requestAction;
      modUser.teamName = user.teamName;
      modUser.userId = user.userId;
      modUser.userName = user.userName;
      modUsers.push(modUser);
    });
    return modUsers;
  }
}
