import {Injectable} from '@angular/core';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Call} from '../models/call.model';

@Injectable()
export class CallAdapter implements IAdapter<Call> {
  adaptToModel(resp: any): Call {
    if (resp.sessionId) {
      const callData = new Call();
      callData.sessionId = resp.sessionId;
      callData.token = resp.token;
      callData.apiKey = resp.apiKey;
      callData.eventId = resp.eventId;
      callData.to = resp.to[0];
      callData.mediaType = resp.callType;
      callData.receiverName = resp.recieverName;
      return callData;
    } else {
      return resp;
    }
  }
  adaptFromModel(data: Call): any {
    const req = {
      from: data.from,
      callType: data.mediaType,
    };
    if (data.to) {
      req['to'] = [data.to];
    }
    if (data.eventId) {
      req['eventId'] = data.eventId;
    }
    if (data.owner) {
      req['overideOwnerCheck'] = true;
    }
    if (data.onCall) {
      req['onCall'] = true;
    }
    if (data['leave']) {
      req['leaveWithoutEnding'] = true;
    }
    return req;
  }
}
