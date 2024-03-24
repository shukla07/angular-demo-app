import {Injectable} from '@angular/core';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {Call} from '../../../audio-video/shared/models/call.model';
import {MALink} from '../../ma-link/ma-link.model';

@Injectable()
export class PickMaCallAdapter implements IAdapter<MALink> {
  constructor(private readonly store: UserSessionStoreService) {}
  adaptToModel(resp: any) {
    if (resp.sessionId) {
      const callData = new Call();
      callData.sessionId = resp.sessionId;
      callData.eventId = resp.eventId;
      callData.apiKey = resp.apiKey;
      callData.token = resp.token;
      callData.mediaType = 'audio';
      return callData;
    }
    return resp;
  }
  adaptFromModel(data: Partial<MALink>) {
    const payload = {
      from: this.store.getUser().id,
      to: data.selected.filter(ele => ele !== this.store.getUser().id),
      eventId: data.eventId,
    };
    payload.to.push(data.caller.id);
    if (data.isVmslCall) {
      payload['onVmslCall'] = true;
    }
    return payload;
  }
}
