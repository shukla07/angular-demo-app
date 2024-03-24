import * as moment from 'moment';
import {EmailModel} from './models/email.model';

export class MailHelper {
  static getForwardBody(mail: EmailModel) {
    return `<br><br><br><br><br><p contenteditable="false"><div>On ${moment(
      mail.time,
    ).format('ddd')}, ${moment(mail.time).format('MM-DD-YYYY')} at ${moment(
      mail.time,
    ).format('hh:mm A')}, ${mail.fromName} wrote:</div><blockquote>${
      mail.htmlContent
    }</blockquote></p>`;
  }

  static filterMails(allMails, isImportant, isUnread) {
    if (isImportant) {
      allMails = allMails.filter(mail => mail.isImportant);
    }
    if (isUnread) {
      allMails = allMails.filter(mail => mail.isNew);
    }
    return allMails;
  }
}
