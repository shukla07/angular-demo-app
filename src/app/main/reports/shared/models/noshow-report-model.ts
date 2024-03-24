export class NoShowReport {
  userName: string;
  noShowCount: number;
  userId: string;
  events: UserEvent[];
}

export class UserEvent {
  summary: string;
  eventType: string;
  startDateTime: string;
  teamName: string;
  createdByName: string;
  organizerName: string;
  attendees: string[];
  eventId: string;
}
