import {HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ApiService} from '@vmsl/core/api/api.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {BehaviorSubject} from 'rxjs';
import {GetInboxMails} from '../../main/mailbox/shared/commands/get-inmails.command';
import {EmailListModel} from '../../main/mailbox/shared/models/email-list.model';
import {GetInboxMailsAdapter} from '../adapters/get-inbox-mails-adapter.service';

@Injectable()
export class CommonService {
  private readonly contentInMail = new BehaviorSubject<Object[]>(null);
  contentInMailObv = this.contentInMail.asObservable();

  private readonly contentInChat = new BehaviorSubject<Object[]>(null);
  contentInChatObv = this.contentInChat.asObservable();

  private readonly emailId = new BehaviorSubject<string>(null);
  emailIdObv = this.emailId.asObservable();

  private readonly unreadMails = new BehaviorSubject<boolean>(null);
  unreadMailsObv = this.unreadMails.asObservable();

  constructor(
    private readonly getInboxMailsAdapter: GetInboxMailsAdapter,
    private readonly apiService: ApiService,
    private readonly store: UserSessionStoreService,
  ) {}

  getMailsForHeaderNotifications() {
    const limit = 10;
    const command: GetInboxMails<EmailListModel> = new GetInboxMails(
      this.apiService,
      this.getInboxMailsAdapter,
      this.store.getUser().tenantId,
      0,
      limit,
    );

    const query = {
      where: {
        visibility: {neq: 'read'},
      },
    };

    var params = new HttpParams();
    params = params.set('filter', JSON.stringify(query));
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  setContentInMail(data: object[]) {
    this.contentInMail.next(data);
  }
  setContentInChat(data: object[]) {
    this.contentInChat.next(data);
  }

  setEmailId(emailId: string) {
    this.emailId.next(emailId);
  }

  setUnreadCount(unreadMails: boolean) {
    this.unreadMails.next(unreadMails);
  }
}
