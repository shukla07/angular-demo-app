export class Queue {
  callerFirstName: string;
  callerLastName: string;
  timeLeft: { leftTime: number; format: string };
  status: string;
  callerRoleName: string;
  teamName: string;
  attendeeFirstName: string;
  attendeeLastName: string;
  callerProfile: string;
  queueId: string;
  callType: string;
  teamId: string;
  startTime: string;
  endTime: string;
  createdOn: string;
  date: string;
  eventId: string;
  managerEscalated: boolean;
  directorEscalated: boolean;
  members = [];
  showTeamMembers = false;

  get caller(): string {
    let fullName = this.callerFirstName;
    if (this.callerLastName) {
      fullName = fullName.concat(' ').concat(this.callerLastName);
    }
    return fullName;
  }

  get attendee(): string {
    let fullName = this.attendeeFirstName;
    if (this.attendeeLastName) {
      fullName = fullName.concat(' ').concat(this.attendeeLastName);
    }
    return fullName;
  }
}
