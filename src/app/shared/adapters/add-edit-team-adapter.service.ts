import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {
  AccessRules,
  AccessRulesAssociation,
  TeamInfo,
} from '../../main/teams-management/shared/models/team-info.model';
import * as moment from 'moment';
import 'moment-timezone';
import {RoleName, RoleType} from '@vmsl/core/enums';
import {DsFlags} from '@vmsl/core/auth/models/user.model';
import {DivisionStates} from '@vmsl/core/enums/division-states.enum';

@Injectable()
export class AddEditTeamAdapter implements IAdapter<any> {
  constructor() {}
  adaptToModel(resp: any) {
    if (resp) {
      const teamInfo = new TeamInfo();
      teamInfo.createdOn = resp.createdOn;
      teamInfo.modifiedOn = resp.modifiedOn;
      teamInfo.createdByName = resp.createdByName;
      teamInfo.modifiedBy = resp.modifiedBy;
      teamInfo.teamId = resp.id;
      teamInfo.teamName = resp.teamName;
      teamInfo.timeZone = resp.timezone;
      resp.availabilityDays &&
        resp.availabilityDays.forEach(element => {
          const day = teamInfo.availability.find(
            ele => ele.day === element.day,
          );
          day.checked = true;
          day.availableFrom =
            element.available_from &&
            moment(element.available_from, 'HH:mm Z')
              .tz(teamInfo.timeZone)
              .format('hh:mm A');
          day.availableTill =
            element.available_till &&
            moment(element.available_till, 'HH:mm Z')
              .tz(teamInfo.timeZone)
              .format('hh:mm A');
        });
      teamInfo.allowAdHocCalls = resp.allowAdHocCalls;
      teamInfo.scheduleCallDisplayOnAvailibility =
        resp.scheduleCallDisplayOnAvailibility;
      teamInfo.managerEscalationMinutes = resp.managerEscalationMinutes;
      teamInfo.directorEscalationMinutes = resp.directorEscalationMinutes;
      teamInfo.status = resp.status;
      teamInfo.tenantsId = resp.tenantId;
      teamInfo.allMembers =
        resp.users && resp.users.filter(ele => ele !== null);
      teamInfo.linkedUsers = this.getLinkedUsers(resp);
      teamInfo.dsFlag = resp.dsFlag;
      teamInfo.isChatOn = resp.chatToggle;
      if (resp.dsFlag === DsFlags.Both) {
        teamInfo.dsTags = this.getDsTags(resp);
      }
      teamInfo.availableMsls = [];
      resp.users &&
        resp.users.forEach(ele => {
          if (ele && ele.role_type === RoleType.msl) {
            teamInfo.msls.push(ele.user_id);
            teamInfo.availableMsls.push({
              id: ele.user_id,
              visibility: ele.user_visibility,
            });
          }
        });
      return teamInfo;
    }
    return resp;
  }
  adaptFromModel(data: Partial<TeamInfo>) {
    const teamResponse = {
      teamDetails: {
        teamName: data.teamName.trim(),
        allowAdHocCalls: data.allowAdHocCalls,
        scheduleCallDisplayOnAvailibility:
          data.scheduleCallDisplayOnAvailibility,
        managerEscalationMinutes: data.managerEscalationMinutes,
        directorEscalationMinutes: data.directorEscalationMinutes,
        status: data.status,
        timezone: data.timeZone,
        dsFlag: data.dsFlag,
        chatToggle: data.isChatOn,
      },
      usersAlloted: this.getUsers(data),
      availabilityDays: this.getAvailability(data),
    };
    if (data.dsFlag === DsFlags.Both) {
      const two = 2;
      teamResponse['territoryDivision'] = data.dsTags[0].selected;
      teamResponse['diseaseDivision'] = data.dsTags[two].selected;
      teamResponse['therapeuticDivision'] = data.dsTags[1].selected;
    }
    return teamResponse;
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

  getSelectedDsTags(dsTag) {
    return dsTag.associatedTo === AccessRulesAssociation.all
      ? []
      : dsTag.selected;
  }

  getLinkedUsers(data) {
    const teamLinkedUsers = [];
    const director = new AccessRules(
      RoleName.director,
      AccessRulesAssociation.na,
    );
    const mml = new AccessRules(RoleName.superMSL, AccessRulesAssociation.na);
    const ml = new AccessRules(RoleName.msl, AccessRulesAssociation.na);
    const hcp = new AccessRules(RoleName.hcp, AccessRulesAssociation.na);
    if (data.users) {
      data.users.forEach(user => {
        switch (user && user.role_name) {
          case RoleName.superMSL:
            mml.elements.push({name: user.user_name, id: user.user_tenant_id});
            mml.selected.push(user.user_tenant_id);
            break;
          case RoleName.msl:
            ml.elements.push({name: user.user_name, id: user.user_tenant_id});
            ml.selected.push(user.user_tenant_id);
            break;
          case RoleName.director:
            director.elements.push({
              name: user.user_name,
              id: user.user_tenant_id,
            });
            director.selected.push(user.user_tenant_id);
            break;
          case RoleName.hcp:
            hcp.elements.push({name: user.user_name, id: user.user_tenant_id});
            hcp.selected.push(user.user_tenant_id);
        }
      });
    }
    teamLinkedUsers.push(ml, mml, director, hcp);
    return teamLinkedUsers;
  }

  getDsTags(team) {
    let territory: AccessRules;
    if (team.dsConfig.territoryDivTag === 'some') {
      territory = new AccessRules(
        DivisionStates.territory,
        AccessRulesAssociation.some,
      );
    } else {
      territory = new AccessRules(
        DivisionStates.territory,
        AccessRulesAssociation.all,
      );
    }
    if (team.territory) {
      territory.elements = team.territory;
      territory.selected = team.territory && team.territory.map(ele => ele.id);
    } else {
      territory.elements = [];
      territory.selected = [];
    }

    let ta: AccessRules;
    if (team.dsConfig.therapeuticDivTag === 'some') {
      ta = new AccessRules(
        DivisionStates.therapeuticArea,
        AccessRulesAssociation.some,
      );
    } else {
      ta = new AccessRules(
        DivisionStates.therapeuticArea,
        AccessRulesAssociation.all,
      );
    }
    if (team.therapeuticAreas) {
      ta.elements = team.therapeuticAreas;
      ta.selected =
        team.therapeuticAreas && team.therapeuticAreas.map(ele => ele.id);
    } else {
      ta.elements = [];
      ta.selected = [];
    }

    let da: AccessRules;
    if (team.dsConfig.diseaseDivTag === 'some') {
      da = new AccessRules(
        DivisionStates.diseaseArea,
        AccessRulesAssociation.some,
      );
    } else {
      da = new AccessRules(
        DivisionStates.diseaseArea,
        AccessRulesAssociation.all,
      );
    }
    if (team.diseaseAreas) {
      da.elements = team.diseaseAreas;
      da.selected = team.diseaseAreas && team.diseaseAreas.map(ele => ele.id);
    } else {
      da.elements = [];
      da.selected = [];
    }
    return [territory, ta, da];
  }

  getUsers(data) {
    let users = [];
    data.linkedUsers.forEach(element => {
      users = users.concat(element.selected);
    });
    return users;
  }
}
