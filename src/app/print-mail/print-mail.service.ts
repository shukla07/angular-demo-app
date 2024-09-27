import {Injectable} from '@angular/core';
import {ApiService} from '@vmsl/core/api/api.service';
import {UserInfo} from '@vmsl/core/auth/models/user.model';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {ContactListAdapter} from '@vmsl/shared/adapters/contact-list-adapter.service';
import {GetContactList} from '@vmsl/shared/commands/get-contact-list.command';
import {Observable} from 'rxjs';
import {GetMailByIdAdapter} from '../main/mailbox/shared/adapters/get-mail-by-id-adapter.service';
import {GetMailById} from '../main/mailbox/shared/commands/get-mail-by-id.command';
import {EmailLoopModel} from '../main/mailbox/shared/models/email-loop.model';

@Injectable()
export class PrintService {
  constructor(
    private readonly apiService: ApiService,
    private readonly store: UserSessionStoreService,
    private readonly getMailByIdAdapter: GetMailByIdAdapter,
    private readonly contactListAdapter: ContactListAdapter,
  ) {}

  getMyContacts(tenantId, userId): Observable<UserInfo[]> {
    const command: GetContactList<UserInfo> = new GetContactList(
      this.apiService,
      this.contactListAdapter,
      tenantId,
      userId,
    );

    return command.execute();
  }

  getMailById(threadId, tenantId) {
    const command: GetMailById<EmailLoopModel> = new GetMailById(
      this.apiService,
      this.getMailByIdAdapter,
      tenantId,
      threadId,
    );

    return command.execute();
  }
}
