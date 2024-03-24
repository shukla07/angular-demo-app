import {Injectable} from '@angular/core';
import {TeamInfo} from '../models/team-info.model';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
@Injectable()
export class TeamsListAdapter implements IAdapter<TeamInfo> {
  adaptToModel(resp: any): TeamInfo {
    const teamsList = new TeamInfo();
    teamsList.availabilityDays = resp.availabilityDays
      ? resp.availabilityDays.map(ele => ele.day)
      : [];
    teamsList.createdByName = resp.createdByName;
    teamsList.createdOn = resp.createdOn;
    teamsList.teamId = resp.id;
    teamsList.teamName = resp.teamName;
    teamsList.tenantsId = resp.tenantsId;
    teamsList.status = resp.status;
    return teamsList;
  }
  adaptFromModel(data: Partial<TeamInfo>) {
    return data;
  }
}
