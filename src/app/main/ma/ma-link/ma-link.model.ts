import {UserInfo} from '@vmsl/core/auth/models/user.model';

export class MALink {
  hcpText: string;
  payor = false;
  payorHcp: string;
  question = [];
  questionText: string;
  diseaseArea = [];
  territory = [];
  therapeuticArea = [];
  jobTitle = [];
  totalFMD: number;
  activeFMD: number;
  activeFMDList: UserInfo[];
  selected: string[];
  isTeamCall: boolean;
  isUserCall: boolean;
  eventId: string;
  team: string[];
  caller = new UserInfo();
  maLink: string;
  receiver = new UserInfo();
  isVmslCall: boolean;
  linkedEventId: string;
}
