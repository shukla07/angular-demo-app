import {Injectable} from '@angular/core';
import {AnyAdapter} from '@vmsl/core/api/adapters/any-adapter.service';
import {ApiService} from '@vmsl/core/api/api.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {ComposeEmailAdapter} from '../adapters/compose-email-adapter.service';
import {GetInboxMailsAdapter} from '../../../../shared/adapters/get-inbox-mails-adapter.service';
import {ComposeMail} from '../commands/compose-mail.command';
import {DeleteMailCommand} from '../commands/delete-mail.command';
import {GetDraftMails} from '../commands/get-draft-mails.command';
import {GetImportantMails} from '../commands/get-important-mails.command';
import {GetInboxMails} from '../commands/get-inmails.command';
import {GetMailById} from '../commands/get-mail-by-id.command';
import {GetSentMails} from '../commands/get-sent-mails.command';
import {GetTrashMails} from '../commands/get-trash-mails.command';
import {MarkImportantCommand} from '../commands/mark-important.command';
import {UploadAttachment} from '../commands/upload-attachment.command';
import {EmailModel} from '../models/email.model';
import {EmailLoopModel} from '../models/email-loop.model';
import {ReplyToMessageCommand} from '../commands/reply-to-message.command';
import {ForwardMailCommand} from '../commands/forward-mail.command';
import {ForwardMailAdapter} from '../adapters/forward-mail-adapter.service';
import {GetDraftsMailsAdapter} from '../adapters/get-draft-mails-adapter.service';
import {RemoveAttachment} from '../commands/remove-attachment.command';
import {AttachmentModel} from '../models/attachment.model';
import {EmailListModel} from '../models/email-list.model';
import {HttpParams} from '@angular/common/http';
import {GetDraftedMailByIdAdapter} from '../adapters/get-drafted-mail-by-id-adapter.service';
import {GetImportantMailsAdapter} from '../adapters/get-important-mails-adapter.service';
import {GetMailByIdAdapter} from '../adapters/get-mail-by-id-adapter.service';
import {GetSentMailsAdapter} from '../adapters/get-sent-mails-adapter.service';
import {GetTrashMailByIdAdapter} from '../adapters/get-trash-mail-by-id-adapter.service';
import {GetTrashMailsAdapter} from '../adapters/get-trash-mails-adapter.service';
import {ReplyToMessageAdapter} from '../adapters/reply-to-message-adapter.service';
import {SendDraftedMailCommand} from '../commands/send-drafted-mail.command';
import {RestoreTrashMailsCommand} from '../commands/restore-trash-mail.command';
import {GetSignedUrlCommand} from '../../../../main/chat/shared/commands/get-signed-url-command';
import {GetMessageById} from '../commands/get-message-by-id.command';

@Injectable()
export class InMailService {
  constructor(
    private readonly apiService: ApiService,
    private readonly store: UserSessionStoreService,
    private readonly composeEmailAdapter: ComposeEmailAdapter,
    private readonly getInboxMailsAdapter: GetInboxMailsAdapter,
    private readonly getImportantMailsAdapter: GetImportantMailsAdapter,
    private readonly getTrashMailsAdapter: GetTrashMailsAdapter,
    private readonly getDraftMailsAdapter: GetDraftsMailsAdapter,
    private readonly getSentMailsAdapter: GetSentMailsAdapter,
    private readonly getMailByIdAdapter: GetMailByIdAdapter,
    private readonly getTrashMailByIdAdapter: GetTrashMailByIdAdapter,

    private readonly getDraftedMailByIdAdapter: GetDraftedMailByIdAdapter,
    private readonly replyToMessageAdapter: ReplyToMessageAdapter,
    private readonly forwardMailAdapter: ForwardMailAdapter,
    private readonly anyAdapter: AnyAdapter,
  ) {}

  getInboxMails(
    offset: number,
    limit: number,
    filterData,
    importantOnly,
    unreadOnly,
  ) {
    const command: GetInboxMails<EmailListModel> = new GetInboxMails(
      this.apiService,
      this.getInboxMailsAdapter,
      this.store.getUser().tenantId,
      offset,
      limit,
    );

    var params: HttpParams;
    params = this.getQueryParams(filterData, importantOnly, unreadOnly);
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getSentMails(
    offset: number,
    limit: number,
    filterData,
    importantOnly,
    unreadOnly,
  ) {
    const command: GetSentMails<EmailListModel> = new GetSentMails(
      this.apiService,
      this.getSentMailsAdapter,
      this.store.getUser().tenantId,
      offset,
      limit,
    );

    var params: HttpParams;
    params = this.getQueryParams(filterData, importantOnly, unreadOnly);
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getImportantMails(
    offset: number,
    limit: number,
    filterData,
    importantOnly,
    unreadOnly,
  ) {
    const command: GetImportantMails<EmailListModel> = new GetImportantMails(
      this.apiService,
      this.getImportantMailsAdapter,
      this.store.getUser().tenantId,
      offset,
      limit,
    );
    var params: HttpParams;
    params = this.getQueryParams(filterData, importantOnly, unreadOnly);
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  replyToMessage(mail: EmailModel) {
    const command: ReplyToMessageCommand<EmailModel> = new ReplyToMessageCommand(
      this.apiService,
      this.replyToMessageAdapter,
      this.store.getUser().tenantId,
      mail.threadId,
      mail.messageId,
    );
    command.parameters = {
      data: mail,
    };
    return command.execute();
  }

  forwardMail(mail: EmailModel) {
    const command: ForwardMailCommand<EmailModel> = new ForwardMailCommand(
      this.apiService,
      this.forwardMailAdapter,
      this.store.getUser().tenantId,
      mail.threadId,
    );
    command.parameters = {
      data: mail,
    };
    return command.execute();
  }

  getDraftsMails(
    offset: number,
    limit: number,
    filterData,
    importantOnly,
    unreadOnly,
  ) {
    const command: GetDraftMails<EmailListModel> = new GetDraftMails(
      this.apiService,
      this.getDraftMailsAdapter,
      this.store.getUser().tenantId,
      offset,
      limit,
    );
    var params: HttpParams;
    params = this.getQueryParams(filterData, importantOnly, unreadOnly);
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getTrashMails(
    offset: number,
    limit: number,
    filterData,
    importantOnly,
    unreadOnly,
  ) {
    const command: GetTrashMails<EmailListModel> = new GetTrashMails(
      this.apiService,
      this.getTrashMailsAdapter,
      this.store.getUser().tenantId,
      offset,
      limit,
    );
    var params: HttpParams;
    params = this.getQueryParams(filterData, importantOnly, unreadOnly);
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  sendOrSaveMail(data: EmailModel) {
    const command: ComposeMail<EmailModel> = new ComposeMail(
      this.apiService,
      this.composeEmailAdapter,
      this.store.getUser().tenantId,
    );
    command.parameters = {
      data: data,
    };
    return command.execute();
  }

  sendSavedDraft(data: EmailModel) {
    const command: SendDraftedMailCommand<EmailModel> = new SendDraftedMailCommand(
      this.apiService,
      this.composeEmailAdapter,
      this.store.getUser().tenantId,
      data.messageId,
    );
    command.parameters = {
      data: data,
    };
    return command.execute();
  }

  // sonarignore:start
  markImportant(ids: string[], isImportant: boolean) {
    const command: MarkImportantCommand<any> = new MarkImportantCommand(
      this.apiService,
      this.anyAdapter,
      this.store.getUser().tenantId,
      isImportant ? 'important' : 'not-important',
    );
    // sonarignore:end
    command.parameters = {
      data: {
        messageIds: ids,
      },
    };
    return command.execute();
  }

  deleteMail(ids, storage: string, action: string) {
    const command: DeleteMailCommand<Object> = new DeleteMailCommand(
      this.apiService,
      this.anyAdapter,
      this.store.getUser().tenantId,
      storage,
      action,
    );
    command.parameters = {
      data: {
        messageIds: ids,
      },
    };
    return command.execute();
  }

  getSignedUrl(key) {
    const command: GetSignedUrlCommand<string> = new GetSignedUrlCommand(
      this.apiService,
      this.anyAdapter,
      this.store.getUser().tenantId,
    );
    var params = new HttpParams();
    const query = {
      key: key,
    };
    params = params.set('filter', JSON.stringify(query));
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  uploadAttachment(data) {
    const formData: FormData = new FormData();
    formData.append('file', data);
    const command: UploadAttachment<FormData> = new UploadAttachment(
      this.apiService,
      this.anyAdapter,
      this.store.getUser().tenantId,
    );
    command.parameters = {
      data: formData,
    };
    return command.execute();
  }

  removeAttachment(attachment: AttachmentModel) {
    // sonarignore:start
    const command: RemoveAttachment<any> = new RemoveAttachment(
      this.apiService,
      this.anyAdapter,
      this.store.getUser().tenantId,
      attachment.messageId,
      attachment.id,
    );
    // sonarignore:end

    return command.execute();
  }

  getMailById(threadId) {
    const command: GetMailById<EmailLoopModel> = new GetMailById(
      this.apiService,
      this.getMailByIdAdapter,
      this.store.getUser().tenantId,
      threadId,
    );

    return command.execute();
  }

  getTrashMailById(threadId) {
    const command: GetMailById<EmailLoopModel> = new GetMailById(
      this.apiService,
      this.getTrashMailByIdAdapter,
      this.store.getUser().tenantId,
      threadId,
    );

    return command.execute();
  }

  getDraftedMailById(messageId) {
    const command: GetMessageById<EmailLoopModel> = new GetMessageById(
      this.apiService,
      this.getDraftedMailByIdAdapter,
      this.store.getUser().tenantId,
      messageId,
    );
    return command.execute();
  }

  // sonarignore:start
  restoreEmailFromTrash(ids: string[]) {
    const command: RestoreTrashMailsCommand<any> = new RestoreTrashMailsCommand(
      this.apiService,
      this.anyAdapter,
      this.store.getUser().tenantId,
    );
    // sonarignore:end

    command.parameters = {
      data: {messageIds: ids},
    };

    return command.execute();
  }

  getQueryParams(filterData, importantOnly, unreadOnly) {
    const query = {
      where: {},
    };

    if (filterData && filterData.userId && filterData.userId.length) {
      query.where['party'] = {
        inq: [filterData.userId],
      };
    }

    if (importantOnly) {
      query.where['isImportant'] = true;
    }

    if (unreadOnly) {
      query.where['visibility'] = {neq: 'read'};
    }

    var params = new HttpParams();
    return params.set('filter', JSON.stringify(query));
  }
}
