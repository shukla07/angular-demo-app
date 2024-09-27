import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import * as moment from 'moment';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {EmailListModel} from '../models/email-list.model';
import {EmailLoopModel} from '../models/email-loop.model';
import {EmailModel} from '../models/email.model';

@Injectable()
export class GetTrashMailsAdapter implements IAdapter<any> {
  constructor(private readonly store: UserSessionStoreService) {}
  adaptToModel(responselist: any): EmailListModel {
    const listModel = new EmailListModel();
    listModel.threads = responselist.items.map(thread => {
      const model = new EmailLoopModel();
      const messages = [];
      thread.message.forEach(m => {
        if (m.group.filter(gp => gp.storage === 'trash')?.length > 0) {
          var emailModel = new EmailModel();
          emailModel.id = m.id;
          emailModel.storage = 'trash';
          messages.push(emailModel);
        }
      });
      model.messages = messages;
      var latestMessage = thread.message[thread.message.length - 1];
      const mailInfo = latestMessage.group.filter(
        item => item.storage === 'trash',
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
      model.isImportant =
        thread.message.filter(
          m =>
            !!m.group.filter(item => item.storage === 'trash')[0]?.isImportant,
        )?.length > 0;
      model.isNew = mailInfo?.visibility === 'new';
      model.time = latestMessage.modifiedOn;
      model.formattedTime = moment(latestMessage.createdOn).format(
        'MM-DD-YYYY h:mm A',
      );
      model.messageIds = messages.map(m => m.id);

      model.subject = latestMessage.subject;
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
}
