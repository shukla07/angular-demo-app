import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {Message} from '../../message.model';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';

@Injectable()
export class GetMessages implements IAdapter<Message> {
  constructor(private readonly store: UserSessionStoreService) {}
  adaptToModel(resp: any): Message {
    if (resp) {
      const message = new Message();
      message.date = new Date(resp.modifiedOn);
      message.canChat = resp.canChat || true;
      message.reply =
        resp.senderId === this.store.getUser().userTenantId ? true : false;
      message.user = {
        name:
          resp.senderId === this.store.getUser().userTenantId
            ? null
            : resp.senderName,
        id: resp.senderId,
      };
      message.text = resp.body;
      message.type =
        resp.attachments && resp.attachments.length ? 'file' : 'text';
      if (resp.attachments && resp.attachments.length) {
        message.files = resp.attachments.map(element => {
          return {
            url: element.key,
            type: element.mime,
            icon: 'file-text-outline',
          };
        });
      }
      return message;
    }
    return resp;
  }
  adaptFromModel(data: Partial<Message>) {
    return data;
  }
}
