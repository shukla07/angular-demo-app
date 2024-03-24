import {Injectable} from '@angular/core';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import * as moment from 'moment';
import {TeamInfo} from '../../main/teams-management/shared/models/team-info.model';

@Injectable()
export class TeamsSettingsAdapter implements IAdapter<TeamInfo> {
  adaptToModel(resp: any) {
    return resp;
  }
  adaptFromModel(data: Partial<TeamInfo>) {
    return {
      allowAdHocCalls: data.allowAdHocCalls,
      availabilityDays: this.getAvailability(data),
      managerEscalationMinutes: data.managerEscalationMinutes,
      directorEscalationMinutes: data.directorEscalationMinutes,
      timezone: data.timeZone,
      scheduleCallDisplayOnAvailibility: data.scheduleCallDisplayOnAvailibility,
      chatToggle: data.isChatOn,
    };
  }

  getAvailability(data: Partial<TeamInfo>) {
    const days = data.availability.filter(ele => ele.checked);
    return days.map(ele => {
      return {
        day: ele.day,
        availableFrom: moment
          .tz(ele.availableFrom, 'HH:mm A', data.timeZone)
          .utc()
          .format('HH:mm Z'),
        availableTill: moment
          .tz(ele.availableTill, 'HH:mm A', data.timeZone)
          .utc()
          .format('HH:mm Z'),
      };
    });
  }
}
