import {DsFlags} from '@vmsl/core/auth/models/user.model';
import {RoleName} from '@vmsl/core/enums';
import {DivisionStates} from '@vmsl/core/enums/division-states.enum';
import {NameId} from '@vmsl/core/models/name-id.model';

export class TeamInfo {
  deleted: boolean;
  createdOn: string;
  modifiedOn: string;
  createdByName: string;
  modifiedBy: string;
  teamId: string;
  teamName: string;
  timeZone = 'America/New_York';
  allowAdHocCalls = true;
  scheduleCallDisplayOnAvailibility = false;
  directorEscalationMinutes: number;
  managerEscalationMinutes: number;
  status = 1;
  tenantsId: string;
  availabilityDays: string[] = [];
  linkedUsers: AccessRules[];
  online = false;
  allMembers = [];
  dsFlag = DsFlags.AssociationOnly;
  dsTags: AccessRules[];
  territories: DivisionState;
  therapeuticAreas: DivisionState;
  diseaseAreas: DivisionState;
  msls: string[] = [];
  availableMsls: Object[];
  isChatOn: boolean;
  availability: TeamAvailability[];


  constructor() {
    const director = new AccessRules(
      RoleName.director,
      AccessRulesAssociation.na,
    );
    const mml = new AccessRules(RoleName.superMSL, AccessRulesAssociation.na);
    const ml = new AccessRules(RoleName.msl, AccessRulesAssociation.na);
    const hcp = new AccessRules(RoleName.hcp, AccessRulesAssociation.na);
    this.linkedUsers = [director, mml, ml, hcp];

    const territory = new AccessRules(
      DivisionStates.territory,
      AccessRulesAssociation.some,
    );
    const ta = new AccessRules(
      DivisionStates.therapeuticArea,
      AccessRulesAssociation.some,
    );
    const da = new AccessRules(
      DivisionStates.diseaseArea,
      AccessRulesAssociation.some,
    );
    this.dsTags = [territory, ta, da];

    const escalationTimeDirector = 45;
    const escalationTimeManager = 30;
    this.directorEscalationMinutes = escalationTimeDirector;
    this.managerEscalationMinutes = escalationTimeManager;
    this.territories = new DivisionState();
    this.therapeuticAreas = new DivisionState();
    this.diseaseAreas = new DivisionState();
    this.availability = [
      new TeamAvailability('monday'),
      new TeamAvailability('tuesday'),
      new TeamAvailability('wednesday'),
      new TeamAvailability('thursday'),
      new TeamAvailability('friday'),
      new TeamAvailability('saturday'),
      new TeamAvailability('sunday'),
    ];
  }
}

export class TeamAvailability {
  day: string;
  checked: boolean;
  availableFrom = '09:00 AM';
  availableTill = '05:00 PM';
  constructor(day) {
    this.day = day;
  }
}

export class DivisionState {
  name: string[];
  id: string[];
}

export enum AccessRulesAssociation {
  all,
  some,
  na,
}

export class AccessRules {
  titleName: string;
  elements: NameId[] = [];
  selected: string[] = [];
  associatedTo?: AccessRulesAssociation;
  constructor(name, associationType) {
    this.titleName = name;
    this.associatedTo = associationType;
  }
}
