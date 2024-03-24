import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {NoShowReport, UserEvent} from '../models/noshow-report-model';
import * as moment from 'moment';

@Injectable()
export class NoShowReportListAdapter implements IAdapter<NoShowReport> {
  adaptToModel(resp: any): NoShowReport {
    const report = new NoShowReport();
    report.userName = resp.name;
    report.noShowCount = resp.count;
    report.userId = resp.id;
    report.events = resp.events.length > 0 && this.getUserEvents(resp.events);
    return report;
  }
  adaptFromModel(data: Partial<NoShowReport>) {
    return data;
  }

  getUserEvents(userEvents: UserEvent[]) {
    const eventsArr = [];
    userEvents.forEach(userEvent => {
      const eventObj = new UserEvent();
      eventObj.summary = userEvent.summary;
      eventObj.eventType =
        userEvent.eventType &&
        userEvent.eventType[0].toUpperCase() +
          userEvent.eventType.substr(1).toLowerCase();
      eventObj.attendees = userEvent.attendees;
      eventObj.teamName =
        userEvent.teamName === 'N.A.'
          ? userEvent.teamName
          : userEvent.teamName[0].toUpperCase() +
            userEvent.teamName.substr(1).toLowerCase();
      eventObj.createdByName = userEvent.createdByName;
      eventObj.organizerName = userEvent.organizerName;
      eventObj.eventId = userEvent.eventId;
      eventObj.startDateTime = moment
        .parseZone(userEvent.startDateTime)
        .local()
        .format('MM/DD/YY, hh:mm A');
      eventsArr.push(eventObj);
    });
    return eventsArr;
  }
}
