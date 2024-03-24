import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import * as moment from 'moment';
import {EmailListModel} from '../models/email-list.model';
import {EmailLoopModel} from '../models/email-loop.model';
import {EmailModel} from '../models/email.model';

@Injectable()
export class GetDraftsMailsAdapter implements IAdapter<any> {
  adaptToModel(responselist: any): EmailListModel {
    const listModel = new EmailListModel();
    listModel.threads = responselist.items.map(thread => {
      const model = new EmailLoopModel();
      const messages = [];
      var emailModel = new EmailModel();
      emailModel.id = thread.id;
      emailModel.storage = 'draft';
      messages.push(emailModel);

      model.messages = messages;
      const senderInfo = thread.group.filter(item => item.type === 'from')[0];

      model.hasAttachment = thread.attachment ? true : false;
      model.messageIds = [messages[0].id];
      model.to = thread.extMetadata ? thread.extMetadata.to : [];
      model.cc = thread.extMetadata ? thread.extMetadata.cc : [];
      model.bcc = thread.extMetadata ? thread.extMetadata.bcc : [];
      model.from = thread.extMetadata ? thread.extMetadata.from : '';
      model.isImportant = thread.group[0].isImportant;
      model.isNew = senderInfo?.visibility === 'new';
      model.time = thread.modifiedOn;
      model.formattedTime = moment(thread.createdOn).format(
        'MM-DD-YYYY h:mm A',
      );
      model.subject = thread.subject;
      model.id = thread.id;
      model.threadId = thread.threadId;
      return model;
    });
    listModel.totalThreadsCount = responselist.totalCount;
    listModel.unreadCount = responselist.unreadCount;
    return listModel;
  }

  adaptFromModel(data) {
    return data;
  }
}
