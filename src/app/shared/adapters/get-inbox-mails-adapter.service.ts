import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import * as moment from 'moment';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {EmailListModel} from '../../main/mailbox/shared/models/email-list.model';
import {EmailLoopModel} from '../../main/mailbox/shared/models/email-loop.model';
import {EmailModel} from '../../main/mailbox/shared/models/email.model';

@Injectable()
export class GetInboxMailsAdapter implements IAdapter<any> {
  constructor(private readonly store: UserSessionStoreService) {}
  adaptToModel(responselist: any): EmailListModel {
    const recipientTypes = ['to', 'bcc', 'cc'];
    const listModel = new EmailListModel();
    listModel.threads = responselist.items.map(thread => {
      const model = new EmailLoopModel();
      const messages = [];
      thread.message.forEach(m => {
        if (
          m.group.filter(gp => gp.storage === 'inbox' || gp.storage === 'send')
            ?.length > 0
        ) {
          var emailModel = new EmailModel();
          emailModel.id = m.id;
          emailModel.storage = 'inbox';
          emailModel.externalMetaData = m.extMetadata;
          messages.push(emailModel);
        }
      });
      model.messages = messages;
      model.messageIds = messages.map(m => m.id);

      var latestMessage = thread.message[thread.message.length - 1];

      const receiverInfo = latestMessage.group.filter(
        item =>
          recipientTypes.includes(item.type) &&
          this.store.getUser().id === item.party,
      )[0];
      model.hasAttachment =
        thread.message.filter(m => m.attachment != null)?.length > 0;
      model.to = thread.thread_ext_metadata
        ? thread.thread_ext_metadata.to
        : [];
      model.cc = thread.thread_ext_metadata
        ? thread.thread_ext_metadata.cc
        : [];
      model.bcc = thread.thread_ext_metadata
        ? thread.thread_ext_metadata.bcc
        : [];
      model.from = thread.thread_ext_metadata
        ? thread.thread_ext_metadata.from
        : '';
      model.isImportant = thread.isImportant;
      model.isNew = receiverInfo?.visibility === 'new';
      model.time = latestMessage.modifiedOn;
      model.formattedTime = moment(latestMessage.group[1]?.createdOn).format(
        'MM-DD-YYYY hh:mm A',
      );
      model.subject = latestMessage.subject;
      model.body = this.getEmailBodyForNotifications(latestMessage);
      model.id = thread.id;
      model.threadId = latestMessage.threadId;
      return model;
    });
    listModel.totalThreadsCount = responselist.totalThreads;
    listModel.unreadCount = responselist.unreadThreads;
    return listModel;
  }

  adaptFromModel(data) {
    return data;
  }

  getEmailBodyForNotifications(latestMessage) {
    if (latestMessage.body.includes('<p>') && latestMessage.extMetadata.from) {
      return `${latestMessage.extMetadata.from.name} replied ...`;
    } else {
      const wordCount = 4;
      return `${latestMessage.body
        .split(' ')
        .splice(0, wordCount)
        .join(' ')} ...`;
    }
  }
}
