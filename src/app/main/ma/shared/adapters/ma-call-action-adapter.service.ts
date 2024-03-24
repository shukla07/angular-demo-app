import {Injectable} from '@angular/core';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {MALink} from '../../ma-link/ma-link.model';

@Injectable()
export class MaCallActionAdapter implements IAdapter<MALink> {
  constructor(private readonly store: UserSessionStoreService) {}
  adaptToModel(resp: any) {
    return resp;
  }
  adaptFromModel(data: Partial<MALink>) {
    const payload = {
      from: this.store.getUser().id,
      eventId: data.eventId,
    };
    if (data.isTeamCall || data.isUserCall) {
      if (data.isTeamCall) {
        payload['to'] = data.selected.map(ele => ele['teamId']);
      } else {
        payload['to'] = data.selected.map(ele => ele['id']);
      }
    } else {
      payload['to'] = data.selected;
    }
    if (data.isVmslCall) {
      payload['onVmslCall'] = data.isVmslCall;
    }
    return payload;
  }
}
