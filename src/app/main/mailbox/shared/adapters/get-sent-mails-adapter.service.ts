import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import * as moment from 'moment';
import {EmailListModel} from '../models/email-list.model';
import {EmailLoopModel} from '../models/email-loop.model';
import {EmailModel} from '../models/email.model';

@Injectable()
export class GetSentMailsAdapter implements IAdapter<any> {
  adaptToModel(responselist: any): EmailListModel {
    const listModel = new EmailListModel();
    listModel.threads = responselist.items.map(thread => {
      const model = new EmailLoopModel();

      const messages = [];
      thread.message.forEach(m => {
        if (m.group.filter(gp => gp.storage === 'send')?.length > 0) {
          var emailModel = new EmailModel();
          emailModel.id = m.id;
          emailModel.storage = 'send';
          emailModel.externalMetaData = m.extMetadata;
          messages.push(emailModel);

          model.formattedTime = moment(m.group[0].createdOn).format(
            'MM-DD-YYYY hh:mm A',
          );
        }
      });

      model.messages = messages;
      var latestMessage = thread.message[thread.message.length - 1];

      const senderInfo = latestMessage.group.filter(
        item => item.type === 'from',
      )[0];
      model.messageIds = messages.map(m => m.id);

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
      model.isNew = senderInfo?.visibility === 'new';
      model.time = latestMessage.modifiedOn;
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
