export class Report {
  id: string;
  createdByName: string;
  startDateTime: string;
  eventType: string;
  callType: string;
  status: string;
  teamName: string;
  endDateTime: string;
  eventName: string;
  duration: string;
  users: object[];
  attendees: string[];
  attendeesCallStarttime: string[];
  attendeesCallDuration: string[];
  organizer: string;
  noShowUserName: string;
  noShowUserId: string;
  noShowCount: string;
  constructor() { }
}

export class AttendeesInfo {
  fullName: string;
  roleName: string;
  id: string;
}
