import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {Chat} from '../chat.model';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {RoleType} from '@vmsl/core/enums';

@Injectable()
export class MessageAdapter implements IAdapter<Chat> {
  constructor(private readonly store: UserSessionStoreService) {}
  adaptToModel(resp: Chat): Chat {
    return resp;
  }
  adaptFromModel(data: Partial<Chat>) {
    const recievers = [];
    let payload;
    if (data.teamChat) {
      payload = {
        teamId: data.teamId,
        isTeamChat: data.teamChat,
        body: data.message.text,
        channelId: data.channelId,
        hcpId: this.getHCP(data) || this.store.getUser().userTenantId,
      };
    } else {
      data.participants.forEach(ele => {
        if (ele['userTenantId'] !== this.store.getUser().userTenantId) {
          recievers.push(ele['userTenantId']);
        }
      });
      payload = {
        recievers,
        body: data.message.text,
        channelId: data.channelId,
      };
    }
    if (data.message.files.length) {
      payload['attachments'] = data.message.files;
    }
    return payload;
  }

  getHCP(data) {
    const hcp = data.participants?.find(ele => ele.roleType === RoleType.hcp);
    return hcp?.userTenantId;
  }
}
