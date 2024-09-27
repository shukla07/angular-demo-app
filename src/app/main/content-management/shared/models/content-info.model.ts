import {
  AccessRules,
  AccessRulesAssociation,
} from '@vmsl/core/auth/models/user.model';
import {RoleName} from '@vmsl/core/enums';
import {DivisionStates} from '@vmsl/core/enums/division-states.enum';

export class Content {
  id: string;
  title: string;
  contentText: string;
  createdByName: string;
  tenantId: string;
  createdOn: string;
  status = 1;
  listImg: string;
  fileUrl: string;
  fileIcon: string;
  fileKey: string;
  fileType: string;
  dsTags: AccessRules[] = [];
  teamsTags: AccessRules[] = [];
  hcpTags: AccessRules[] = [];
  dsFlag: boolean;
  teamsFlag: boolean;
  hcpFlag: boolean;
  unrestricted = false;
  isDownloadable: boolean;

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

    this.hcpTags = [new AccessRules(RoleName.hcp, AccessRulesAssociation.na)];

    this.teamsTags = [new AccessRules('Team', AccessRulesAssociation.na)];
  }
}
