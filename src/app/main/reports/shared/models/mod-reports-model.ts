import {AccessRules} from '@vmsl/core/auth/models/user.model';

export class ModReports {
  eventId: string;
  linkedEventId: string;
  requestorName: string;
  requestorId: string;
  requestSentDate: string;
  requestAcceptedDate: string;
  hcpOrPayorName: string[];
  presetQuestions: string[];
  jobTitle: string[];
  territory: string[];
  therapeuticArea: string[];
  diseaseArea: string[];
  requestedTeams: string[];
  requestTimeout: string;
  endDateTime: string;
  duration: string;
  modUsersReports: ModUsers[];
  dsTags: AccessRules[];

  constructor() {
    this.modUsersReports = [new ModUsers()];
  }
}

export class ModUsers {
  actionDateTime: string;
  requestAction: string;
  teamName: string;
  userId: string;
  userName: string;
}

export class ModMetric {
  metric: string;
  value: string;
}
