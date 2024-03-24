import {Injectable} from '@angular/core';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {MALink} from '../../ma-link/ma-link.model';

@Injectable()
export class MaCallAdapter implements IAdapter<MALink> {
  constructor(private readonly store: UserSessionStoreService) {}
  adaptToModel(resp: any) {
    return resp;
  }
  adaptFromModel(data: Partial<MALink>) {
    const payload = {
      from: this.store.getUser().id,
      questions: data.question,
      requestText: data.questionText,
      divTags: [
        {
          filterTa: data.therapeuticArea.map(ele => ele.name),
          filterDa: data.diseaseArea.map(ele => ele.name),
          filterTerritory: data.territory.map(ele => ele.name),
          filterJobTitle: data.jobTitle.map(ele => ele.jobTitle),
        },
      ],
      hcpOrPayor: data.hcpText,
      isPayor: data.payor,
      isTeamCall: data.isTeamCall,
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
    if (data.linkedEventId) {
      payload['linkedEventId'] = data.linkedEventId;
      payload['isLinkedEvent'] = true;
    }
    return payload;
  }
}
