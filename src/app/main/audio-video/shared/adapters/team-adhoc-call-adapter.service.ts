import {Injectable} from '@angular/core';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {TeamCall} from '../models/call.model';

@Injectable()
export class TeamAdhocCallAdapter implements IAdapter<TeamCall> {
  adaptToModel(resp: any): TeamCall {
    if (resp) {
      const callData = new TeamCall();
      callData.sessionId = resp.sessionId;
      callData.token = resp.token;
      callData.apiKey = resp.apiKey;
      callData.eventId = resp.eventId;
      callData.receiverName = resp.teamDetails.name;
      callData.mediaType = resp.callType;
      callData.queueId = resp.teamDetails.teamQueueId;
      callData.teamId = resp.teamDetails.id;
      return callData;
    }
    return resp;
  }
  adaptFromModel(data: TeamCall): any {
    if (data) {
      return {
        requestType: data.requestType,
        callType: data.mediaType,
      };
    }
    return null;
  }
}
