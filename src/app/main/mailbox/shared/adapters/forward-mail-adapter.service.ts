import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {EmailModel} from '../models/email.model';

@Injectable()
export class ForwardMailAdapter implements IAdapter<any> {
  adaptToModel(resp: any): any {
    return resp;
  }

  adaptFromModel(mail: EmailModel) {
    const data = {};

    const toList = mail.to.map(toId => {
      return {
        type: 'to',
        userId: toId.id,
      };
    });
    if (mail.bcc?.length) {
      data['bcc'] = mail.bcc.map(bccId => {
        return {
          type: 'bcc',
          userId: bccId.id,
        };
      });
    }
    if (mail.cc?.length) {
      data['cc'] = mail.cc.map(ccId => {
        return {
          type: 'cc',
          userId: ccId.id,
        };
      });
    }

    data['to'] = toList;
    data['subject'] = mail.subject;
    data['status'] = 'send';
    data['body'] = mail.htmlContent;
    data['extMetadata'] = {
      from: mail.from,
      to: mail.to,
      cc: mail.cc,
      bcc: mail.bcc,
    };
    data['forwardMailTimestamp'] = mail.formattedTime;
    if (mail.uploadedAttachmentsInfo && mail.uploadedAttachmentsInfo.length) {
      mail.uploadedAttachmentsInfo.forEach(attach => {
        delete attach['imageUrl'];
        delete attach.id;
      });
      data['attachments'] = mail.uploadedAttachmentsInfo;
    }
    return data;
  }
}
