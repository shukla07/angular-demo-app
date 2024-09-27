import {HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AnyAdapter} from '@vmsl/core/api/adapters/any-adapter.service';
import {ApiService} from '@vmsl/core/api/api.service';
import {UserInfo} from '@vmsl/core/auth/models/user.model';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';

import {BehaviorSubject} from 'rxjs';
import {Message} from '../message.model';
import {GetChatAdapter} from './adapters/get-chat-adapter.service';
import {GetMessages} from './adapters/get-messages-adapter.service';
import {MessageAdapter} from './adapters/message-adapter.service';
import {Chat} from './chat.model';
import {ExistingChatCommand} from './commands/existing-chat-command';
import {ExportChatCommand} from './commands/export-chat-command';
import {GetChatById} from './commands/get-chat-by-id-command';
import {GetChatCountCommand} from './commands/get-chat-count-command';
import {GetChatsCommand} from './commands/get-chats-command';
import {GetSignedUrlCommand} from './commands/get-signed-url-command';
import {MarkChatReadCommand} from './commands/mark-chat-read-command';
import {SendMessageCommand} from './commands/send-message-command';
import {TypingCommand} from './commands/send-typing-command';
import {UploadDocumentCommand} from './commands/upload-document-command';
import * as moment from 'moment';

@Injectable()
export class ChatFacadeService {
  constructor(
    private readonly apiService: ApiService,
    private readonly store: UserSessionStoreService,
    private readonly messageAdapter: MessageAdapter,
    private readonly getChatAdapter: GetChatAdapter,
    private readonly getMessages: GetMessages,
    private readonly anyAdapter: AnyAdapter,
  ) {}

  private readonly chat = new BehaviorSubject<UserInfo>(null);
  chatObv = this.chat.asObservable();

  sendMessage(data: Chat) {
    const command: SendMessageCommand<Chat> = new SendMessageCommand(
      this.apiService,
      this.messageAdapter,
      this.store.getUser().tenantId,
    );
    command.parameters = {
      data,
    };
    return command.execute();
  }

  getAllChats(skip: number, id?: string) {
    const command: GetChatsCommand<Chat> = new GetChatsCommand(
      this.apiService,
      this.getChatAdapter,
      this.store.getUser().tenantId,
    );
    const query = {
      where: {
        and: [{id: id}],
      },
      order: ['createdOn DESC'],
      limit: 50,
      skip: skip,
    };
    let params = new HttpParams();
    params = params.set('filter', JSON.stringify(query));
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getFilteredChatList(filter) {
    const command: GetChatsCommand<Chat> = new GetChatsCommand(
      this.apiService,
      this.getChatAdapter,
      this.store.getUser().tenantId,
    );
    const query = {
      where: {
        and: [{searchParticipants: {ilike: `%${filter}%`}}],
      },
    };

    let params = new HttpParams();
    params = params.set('filter', JSON.stringify(query));
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  getChatsCount() {
    const command: GetChatCountCommand<Chat> = new GetChatCountCommand(
      this.apiService,
      this.anyAdapter,
      this.store.getUser().tenantId,
    );
    return command.execute();
  }

  getChatById(data: Chat, skip: number) {
    const command: GetChatById<Message> = new GetChatById(
      this.apiService,
      this.getMessages,
      this.store.getUser().tenantId,
      data.channelId,
    );
    const query = {
      limit: 50,
      offset: skip,
      order: ['createdOn DESC'],
    };
    let params = new HttpParams();
    params = params.set('filter', JSON.stringify(query));
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  findExistingChat(data: Chat) {
    const command: ExistingChatCommand<Chat> = new ExistingChatCommand(
      this.apiService,
      this.messageAdapter,
      this.store.getUser().tenantId,
    );
    command.parameters = {
      data,
    };
    return command.execute();
  }

  setChatId(user) {
    this.chat.next(user);
  }

  getSignedUrl() {
    const command: GetSignedUrlCommand<object> = new GetSignedUrlCommand(
      this.apiService,
      this.anyAdapter,
      this.store.getUser().tenantId,
    );
    const query = {
      key: this.store.getUser().photoUrl,
    };
    let params = new HttpParams();
    params = params.set('filter', JSON.stringify(query));
    command.parameters = {
      query: params,
    };
    return command.execute();
  }

  uploadDocuments(file) {
    const formData: FormData = new FormData();
    formData.append('file', file);
    const command: UploadDocumentCommand<object> = new UploadDocumentCommand(
      this.apiService,
      this.anyAdapter,
      this.store.getUser().tenantId,
    );

    command.parameters = {
      data: formData,
    };

    return command.execute();
  }

  markConversation(chat: Chat) {
    const command: MarkChatReadCommand<object> = new MarkChatReadCommand(
      this.apiService,
      this.anyAdapter,
      this.store.getUser().tenantId,
    );

    command.parameters = {
      data: {
        channelId: chat.channelId,
      },
    };

    return command.execute();
  }

  sendTypingSignal(chat: Chat) {
    const command: TypingCommand<Object> = new TypingCommand(
      this.apiService,
      this.anyAdapter,
      this.store.getUser().tenantId,
    );

    const payload = {
      channels: [chat.channelId],
      message: `${this.store.getUser().firstName} ${
        this.store.getUser().lastName
      }`,
    };

    command.parameters = {
      data: payload,
    };

    return command.execute();
  }

  exportChat(channelId, startDate, endDate) {
    const command: ExportChatCommand<Object> = new ExportChatCommand(
      this.apiService,
      this.anyAdapter,
      this.store.getUser().tenantId,
      channelId,
    );

    const filter = {
      where: {and: [{createdOn: {between: [startDate, endDate]}}]},
    };
    var params = new HttpParams();
    params = params
      .set('filter', JSON.stringify(filter))
      .set('timezone', moment.tz.guess());

    command.parameters = {
      observe: 'body',
      query: params,
    };

    return command.execute();
  }
}
