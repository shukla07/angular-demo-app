import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {EmailModel} from '../models/email.model';

@Injectable()
export class ReplyToMessageAdapter implements IAdapter<any> {
  adaptToModel(resp: any): any {
    return resp;
  }

  adaptFromModel(mail: EmailModel) {
    let recipients = [];
    let toList = [];
    let ccList = [];
    let bccList = [];
    if (mail?.to?.length) {
      toList = mail.to.map(user => {
        return {
          type: 'to',
          userId: user.id,
        };
      });
    }

    if (mail?.cc?.length) {
      ccList = mail.cc.map(user => {
        return {
          type: 'cc',
          userId: user.id,
        };
      });
    }

    if (mail?.bcc?.length) {
      bccList = mail.bcc.map(user => {
        return {
          type: 'bcc',
          userId: user.id,
        };
      });
    }

    recipients = [...toList, ...bccList, ...ccList];

    const requestBody = {
      to: recipients,
      subject: mail.subject,
      body: mail.htmlContent,
      status: mail.status,
      extMetadata: {
        from: mail.from,
        to: mail.to,
        cc: mail.cc,
        bcc: mail.bcc,
      },
      isImportant: mail.isImportant,
    };
    if (mail.uploadedAttachmentsInfo && mail.uploadedAttachmentsInfo.length) {
      requestBody['attachments'] = mail.uploadedAttachmentsInfo;
    }
    return requestBody;
  }
}
