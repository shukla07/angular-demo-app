export class Call {
  sessionId?: string;
  token?: string;
  apiKey?: string;
  from?: string;
  mediaType?: string;
  to?: string;
  receiverName?: string;
  eventId?: string;
  queueId?: string;
  teamId?: string;
  owner?: boolean;
  onCall?: boolean;
}

export class TeamCall {
  sessionId?: string;
  token?: string;
  apiKey?: string;
  teamId?: string;
  queueId?: string;
  eventId?: string;
  receiverName?: string;
  requestType?: string;
  mediaType?: string;
}
