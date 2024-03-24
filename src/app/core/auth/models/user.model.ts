import {DivisionStates} from '@vmsl/core/enums/division-states.enum';
import {UserVisibility} from '@vmsl/core/enums/user-presence.enum';
import {NameId} from '@vmsl/core/models';

export class UserInfo {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  addressLine1 = '';
  addressLine2 = '';
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  photoUrl: string;
  photoKey: string;
  role: string;
  roleType: number;
  roleName: string;
  createdBy: string;
  createdOn: string;
  id: string;
  status = 0;
  slotAvailibility: boolean;
  relationships: AccessRules[];
  linkedUsersName: string[];
  permissions: string[];
  tenantId: string;
  userTenantId: string;
  referralCode: string;
  referralStatus: boolean;
  referralName: string;
  referralRole: string;
  referredBy: string;
  licenseNumber: string;
  institute: string;
  organisationId: string[];
  locked: boolean;
  timeZone = 'America/New_York';
  isCalSync: boolean;
  favourite: boolean;
  teamNames: string[];
  userVisibility: UserVisibility;
  dsFlag = DsFlags.AssociationOnly;
  isOnCall = false;
  maLink: string;
  dsTags: AccessRules[] = [];
  jobTitle: string;
  userTitle: string;
  tenantPhotoUrl: string;
  diseaseAreas: [];
  territory: [];
  therapeuticAreas: [];

  get fullName(): string {
    let fullName = this.firstName;
    if (this.lastName) {
      fullName = fullName.concat(' ').concat(this.lastName);
    }
    return fullName;
  }

  get nameWithRole(): string {
    let nameWithRole = this.fullName;
    if (this.userTitle) {
      nameWithRole = nameWithRole.concat(' (', this.userTitle, ')');
    }
    return nameWithRole;
  }

  constructor() {
    const territorry = new AccessRules(
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
    this.dsTags.push(territorry, ta, da);
  }
}

export enum DsFlags {
  AssociationOnly,
  Both,
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
