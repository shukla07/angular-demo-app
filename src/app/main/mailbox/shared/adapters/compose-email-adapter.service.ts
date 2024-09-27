import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {EmailModel} from '../models/email.model';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';

@Injectable()
export class ComposeEmailAdapter implements IAdapter<EmailModel> {
  constructor(private readonly store: UserSessionStoreService) {}
  adaptToModel(resp: any): any {
    return resp;
  }
  adaptFromModel(data: EmailModel) {
    let recipients = [];
    let toList = [];
    let ccList = [];
    let bccList = [];
    if (data?.to?.length) {
      toList = data.to.map(user => {
        return {
          type: 'to',
          userId: user.id,
        };
      });
    }

    if (data?.cc?.length) {
      ccList = data.cc.map(user => {
        return {
          type: 'cc',
          userId: user.id,
        };
      });
    }

    if (data?.bcc?.length) {
      bccList = data.bcc.map(user => {
        return {
          type: 'bcc',
          userId: user.id,
        };
      });
    }

    recipients = [...toList, ...bccList, ...ccList];

    const requestBody = {
      to: recipients,
      subject: data.subject,
      body: data.htmlContent,
      status: data.status, // or send
      extMetadata: {
        from: data.from,
        to: data.to,
        cc: data.cc,
        bcc: data.bcc,
      },
      attachments: data.uploadedAttachmentsInfo?.map(a => {
        return {
          mime: a.mime,
          path: a.path,
          thumbnail: a.thumbnail,
          name: a.name,
        };
      }),
      isImportant: data.isImportant,
    };

    requestBody.extMetadata.from['userName'] = this.store.getUser().username;

    return requestBody;
  }
}
