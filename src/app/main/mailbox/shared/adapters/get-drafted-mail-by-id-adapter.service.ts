import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import * as moment from 'moment';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {AttachmentModel} from '../models/attachment.model';
import {EmailLoopModel} from '../models/email-loop.model';
import {EmailModel} from '../models/email.model';

@Injectable()
export class GetDraftedMailByIdAdapter implements IAdapter<EmailLoopModel> {
  constructor(private readonly store: UserSessionStoreService) {}
  adaptToModel(resp: any): any {
    const loopModel = new EmailLoopModel();
    loopModel.subject = resp.item.subject;
    const model = new EmailModel();
    model.subject = loopModel.subject;
    model.htmlContent = resp.item.body;
    model.id = resp.item.messageId;
    model.messageId = resp.item.id;
    model.threadId = resp.item.threadId;
    loopModel.messages = resp.item.group.map(mail => {
      model.to = mail.extMetadata ? mail.extMetadata.to : [];
      model.cc = mail.extMetadata ? mail.extMetadata.cc : [];
      model.bcc = mail.extMetadata ? mail.extMetadata.bcc : [];
      model.from = mail.extMetadata ? mail.extMetadata.from : '';
      model.isImportant = !!mail?.isImportant;
      model.isNew = mail?.visibility === 'new';
      model.time = mail.modifiedOn;
      model.formattedTime = moment(mail.createdOn).format('MM-DD-YYYY hh:mm A');
      return model;
    });
    if (resp.item.attachment?.length) {
      const attachments = resp.item.attachment.map(a => {
        const attachment = new AttachmentModel();
        attachment.name = a.name;
        attachment.path = a.path;
        attachment.mime = a.mime;
        attachment.thumbnail = a.thumbnail;
        attachment.id = a.id;
        attachment.messageId = a.messageId;
        return attachment;
      });
      model.uploadedAttachmentsInfo = attachments;
    } else {
      model.uploadedAttachmentsInfo = [];
    }

    return loopModel;
  }

  adaptFromModel(data: EmailLoopModel) {
    return data;
  }
}
