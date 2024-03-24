import { IAdapter } from '@vmsl/core/api/adapters/i-adapter';
import { Injectable } from '@angular/core';
import { Report } from '../models/report-model';
import * as moment from 'moment';

@Injectable()
export class ReportListAdapter implements IAdapter<Report> {
  adaptToModel(resp: any): Report {
    if (resp) {
      const isTeamNameArr = this.checkJSON(resp.teamName);
      const report = new Report();
      report.eventName = resp.summary;
      report.eventType =
        resp.eventType === 'MoD'
          ? resp.eventType
          : resp.eventType &&
          resp.eventType[0].toUpperCase() +
          resp.eventType.substr(1).toLowerCase();
      report.callType =
        resp.callType &&
        resp.callType[0].toUpperCase() + resp.callType.substr(1).toLowerCase();
      report.startDateTime = moment
        .parseZone(resp.startDateTime)
        .local()
        .format('MM/DD/YY, hh:mm A');
      report.endDateTime = moment
        .parseZone(resp.endDateTime)
        .local()
        .format('MM/DD/YY, hh:mm A');
      report.duration = this.getReportDuration(resp);
      report.teamName = isTeamNameArr ? JSON.parse(resp.teamName).join(","): resp.teamName;
      report.createdByName = resp.createdByName;
      report.attendees = resp.attendees;
      report.id = resp.id;
      report.status =
        resp.status === 'durationnotavailable'
          ? 'Answered- Duration Not Available'
          : resp.status[0].toUpperCase() + resp.status.substr(1).toLowerCase();
      resp.users &&
        resp.users.forEach(user => {
          if (user.is_organizer) {
            report.organizer = `${user.attendee_metadata.userDetails.firstName} ${user.attendee_metadata.userDetails.lastName}`;
          }
        });
      return report;
    }
    return resp;
  }
  adaptFromModel(data: Partial<Report>) {
    return data;
  }

  getReportDuration(resp) {
    let duration = '';
    if (!resp.duration) {
      if (resp.status === 'declined') {
        duration = '00:00:00';
      }
    } else {
      if (resp.status === 'durationnotavailable') {
        duration = null;
      } else {
        duration = resp.duration;
      }
    }
    return duration;
  }

  checkJSON(text) {
    if (typeof text !== "string") {
        return false;
    }
    try {
        JSON.parse(text);
        return true;
    } catch (error) {
        return false;
    }
  }
}
