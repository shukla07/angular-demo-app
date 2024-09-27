import {Injectable} from '@angular/core';

import * as OT from '@opentok/client';
import {Observable} from 'rxjs';
import {VideoCallCommand} from './commands/video-call.command';
import {ApiService} from '@vmsl/core/api/api.service';
import {AnyAdapter} from '@vmsl/core/api/adapters/any-adapter.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {DisconnectCallCommand} from './commands/disconnect-call.command';
import {PickCallCommand} from './commands/pick-call.command';
import {MissedCallCommand} from './commands/missed-call.command';
import {HttpParams} from '@angular/common/http';
import {JoinMeetingCommand} from './commands/join-meeting.command';
import {LeaveMeetingCommand} from './commands/leave-meeting.command';
import {GetMeetingDetailsCommand} from './commands/get-meeting-details.command';
import {ShareScreenLogCommand} from './commands/share-screen-log.command';
import {MakeTeamAdhocCallCommand} from './commands/make-team-adhoc-call.command';
import {EndTeamAdhocCallCommand} from './commands/end-team-adhoc-call.command';
import {AddAttendeeCommand} from './commands/add-attendee.command';
import {Call, TeamCall} from './models/call.model';
import * as moment from 'moment';
import {tap} from 'rxjs/operators';
import {CallAdapter} from './adapters/call-adapter.service';
import {TeamAdhocCallAdapter} from './adapters/team-adhoc-call-adapter.service';

@Injectable()
export class OpentokService {
  session: OT.Session;
  token: string;

  constructor(
    private readonly apiService: ApiService,
    private readonly anyAdapter: AnyAdapter,
    private readonly store: UserSessionStoreService,
    private readonly callAdapter: CallAdapter,
    private readonly teamAdhocCallAdapter: TeamAdhocCallAdapter,
  ) {}

  getOT() {
    return OT;
  }

  initSession(apiKey: string, sessionId: string, token: string) {
    this.session = this.getOT().initSession(apiKey, sessionId);
    this.token = token;
    return Promise.resolve(this.session);
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.session.connect(this.token, err => {
        if (err) {
          reject(err);
        } else {
          resolve(this.session);
        }
      });
    });
  }

  makeCall(to: string, mediaType: string): Observable<Call> {
    const command: VideoCallCommand<Call> = new VideoCallCommand(
      this.apiService,
      this.callAdapter,
      this.store.getUser().tenantId,
    );
    const data = {
      from: this.store.getUser().id,
      to,
      mediaType,
    };

    command.parameters = {
      data: data,
    };

    return command.execute().pipe(
      tap(res => {
        this.store.setCallData(res);
      }),
    );
  }

  disconnectCall(
    mediaType: string,
    eventId: string,
    to: string,
  ): Observable<Call> {
    const command: DisconnectCallCommand<Call> = new DisconnectCallCommand(
      this.apiService,
      this.callAdapter,
      this.store.getUser().tenantId,
    );
    const data = {
      to,
      from: this.store.getUser().id,
      mediaType,
      eventId,
    };

    command.parameters = {
      data: data,
    };

    return command.execute();
  }

  pickCall(from: string, mediaType: string, eventId: string): Observable<Call> {
    const command: PickCallCommand<Call> = new PickCallCommand(
      this.apiService,
      this.callAdapter,
      this.store.getUser().tenantId,
    );
    const data = {
      from: this.store.getUser().id,
      to: from,
      mediaType,
      eventId,
    };

    command.parameters = {
      data: data,
    };

    return command.execute().pipe(
      tap(res => {
        this.store.setCallData(res);
      }),
    );
  }

  missedCall(
    to: string,
    callType: string,
    eventId: string,
    busy?: string,
  ): Observable<Call> {
    const command: MissedCallCommand<Call> = new MissedCallCommand(
      this.apiService,
      this.callAdapter,
      this.store.getUser().tenantId,
    );
    const data = {
      from: this.store.getUser().id,
      to,
      callType,
      eventId,
    };

    if (busy === 'busy') {
      data['isBusy'] = true;
    }

    command.parameters = {
      data: data,
    };

    return command.execute();
  }

  joinMeeting(eventId): Observable<Call> {
    const command: JoinMeetingCommand<Call> = new JoinMeetingCommand(
      this.apiService,
      this.anyAdapter,
      this.store.getUser().tenantId,
    );

    const data = {
      from: this.store.getUser().id,
      eventId,
    };

    command.parameters = {
      data: data,
    };

    return command.execute().pipe(
      tap(res => {
        this.store.setCallData(res);
      }),
    );
  }

  leaveMeeting(
    eventId: string,
    owner: boolean,
    onCall: boolean,
    leave = false,
  ): Observable<Call> {
    const command: LeaveMeetingCommand<Call> = new LeaveMeetingCommand(
      this.apiService,
      this.callAdapter,
      this.store.getUser().tenantId,
    );

    const data = {
      from: this.store.getUser().id,
      eventId,
      owner,
      onCall,
      leave,
    };

    command.parameters = {
      data: data,
    };

    return command.execute();
  }

  getMeetingDetails(eventId) {
    const command: GetMeetingDetailsCommand<Call> = new GetMeetingDetailsCommand(
      this.apiService,
      this.anyAdapter,
      this.store.getUser().tenantId,
    );

    const q = {
      where: {
        id: eventId,
      },
    };

    let params = new HttpParams();
    params = params.set('filter', JSON.stringify(q));

    command.parameters = {
      query: params,
    };

    return command.execute();
  }

  shareScreenLog(action: string, eventId: string) {
    const command: ShareScreenLogCommand<Object> = new ShareScreenLogCommand(
      this.apiService,
      this.anyAdapter,
      this.store.getUser().tenantId,
      action,
    );

    const data = {
      id: this.store.getUser().id,
      createdAt: moment().toISOString(),
      eventId: eventId,
    };

    command.parameters = {
      data: data,
    };

    return command.execute();
  }

  teamAdhocCall(id: string, mediaType: string): Observable<TeamCall> {
    const command: MakeTeamAdhocCallCommand<TeamCall> = new MakeTeamAdhocCallCommand(
      this.apiService,
      this.teamAdhocCallAdapter,
      this.store.getUser().tenantId,
      id,
    );

    command.parameters = {
      data: {
        requestType: 'adhoc-call',
        mediaType,
      },
    };

    return command.execute().pipe(
      tap(res => {
        this.store.setCallData(res);
      }),
    );
  }

  endTeamAdhocCall(queueId: string, teamId: string, action: string) {
    const command: EndTeamAdhocCallCommand<TeamCall> = new EndTeamAdhocCallCommand(
      this.apiService,
      this.teamAdhocCallAdapter,
      this.store.getUser().tenantId,
      teamId,
      queueId,
    );

    let params = new HttpParams();
    params = params.set('action', action);

    command.parameters = {
      query: params,
      data: null,
    };

    return command.execute().pipe(
      tap(res => {
        this.store.setCallData(res);
      }),
    );
  }

  // sonarignore:start
  addAttendee(eventId, attendee, callType, alreadyAdded) {
    const command: AddAttendeeCommand<any> = new AddAttendeeCommand(
      this.apiService,
      this.anyAdapter,
      this.store.getUser().tenantId,
      eventId,
    );
    // sonarignore:end

    command.parameters = {
      data: {
        attendeeId: attendee,
        callType,
      },
    };
    if (alreadyAdded) {
      command.parameters.data['alreadyAdded'] = true;
    }

    return command.execute();
  }
}
