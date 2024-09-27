import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';

import * as moment from 'moment';
import {AttachmentModel} from '../models/attachment.model';
import {EmailLoopModel} from '../models/email-loop.model';
import {EmailModel} from '../models/email.model';

@Injectable()
export class GetTrashMailByIdAdapter implements IAdapter<EmailLoopModel> {
  constructor(private readonly store: UserSessionStoreService) {}
  adaptToModel(resp: any): any {
    const loopModel = new EmailLoopModel();
    loopModel.subject = resp.items[0].subject;
    loopModel.messageCounts = resp.messageCount;
    resp.items = resp.items.filter(i => {
      const currentUserGroup = i.group.filter(
        item => item.party === this.store.getUser().id,
      )[0];
      return currentUserGroup.storage === 'trash';
    });
    loopModel.messages = resp.items.map(mail => {
      const model = new EmailModel();
      const currentUserGroup = mail.group.filter(
        item => item.party === this.store.getUser().id,
      )[0];
      model.to = mail.messageExtMetaData ? mail.messageExtMetaData.to : [];
      model.cc = mail.messageExtMetaData ? mail.messageExtMetaData.cc : [];
      model.bcc = mail.messageExtMetaData ? mail.messageExtMetaData.bcc : [];
      model.from = mail.messageExtMetaData
        ? mail.messageExtMetaData.from
        : '';
      model.isImportant = !!currentUserGroup?.isImportant;
      model.isNew = currentUserGroup?.visibility === 'new';
      model.time = mail.modifiedOn;
      model.formattedTime = moment(mail.group[0].createdOn).format(
        'MM-DD-YYYY hh:mm A',
      );
      model.extendedFormattedTime = `${moment(mail.time).format(
        'ddd',
      )}, ${moment(mail.time).format('MM-DD-YYYY')} at ${moment(
        mail.time,
      ).format('hh:mm A')}`;
      model.subject = mail.subject;
      model.htmlContent = mail.body;
      model.id = mail.messageId;
      model.messageId = mail.messageId;
      model.threadId = mail.id;
      model.storage = currentUserGroup.storage;

      if (mail.attachment?.length) {
        const attachments = mail.attachment.map(a => {
          const attachment = new AttachmentModel();
          attachment.name = a.name;
          attachment.path = a.path;
          attachment.mime = a.mime;
          attachment.id = a.id;
          attachment.messageId = a.messageId;
          attachment.thumbnail = a.thumbnail;
          return attachment;
        });
        model.uploadedAttachmentsInfo = attachments;
      }

      return model;
    });

    return loopModel;
  }

  adaptFromModel(data: EmailLoopModel) {
    return data;
  }
}
