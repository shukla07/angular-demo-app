import { IAdapter } from '@vmsl/core/api/adapters/i-adapter';
import { Injectable } from '@angular/core';
import { Chat } from '../chat.model';
import { UserSessionStoreService } from '@vmsl/core/store/user-session-store.service';
import * as moment from 'moment';
import { RoleType } from '@vmsl/core/enums';

@Injectable()
export class GetChatAdapter implements IAdapter<Chat> {
  constructor(private readonly store: UserSessionStoreService) { }
  adaptToModel(resp: any): Chat {
    if (resp) {
      const two = 2;
      const day = 86400;
      const chat = new Chat();
      chat.channelId = resp.id;
      chat.participantsString = resp.searchParticipants;
      resp.participants.forEach(element => {
        if (element.userTenantId === this.store.getUser().userTenantId) {
          element.jobTitle = 'You';
        }
        chat.participants.push(element);
      });
      chat.unreadCount = resp.unreadCount;
      if (resp.participants.length === two) {
        this.getNameForOneToOne(resp, chat);
      } else if (resp.teamId) {
        chat.chatName = resp.teamName;
        chat.chatTitle = 'Team';
        chat.teamChat = true;
        chat.teamId = resp.teamId;
        chat.hcpName = resp.participants?.filter(
          ele => ele.roleType === RoleType.hcp,
        )[0]?.name;
      } else {
        this.getNameForMultiUser(resp, chat);
      }
      chat.date =
        moment().diff(resp.createdOn, 'seconds') > day
          ? moment(resp.createdOn).format('L')
          : moment(resp.createdOn).format('LT');
      chat.createdBy = resp.createdBy;
      return chat;
    }
    return resp;
  }
  adaptFromModel(data: Partial<Chat>) {
    return data;
  }

  getNameForOneToOne(resp, chat) {
    resp.participants.forEach(element => {
      if (element.userTenantId !== this.store.getUser().userTenantId) {
        chat.chatName = element.name;
        chat.chatTitle = element['jobTitle']
          ? element['jobTitle']
          : element['roleName'];
        chat.chatProfile = element.imageKey;
      }
    });
  }

  getNameForMultiUser(resp, chat) {
    resp.participants.forEach(element => {
      if (element.userTenantId !== this.store.getUser().userTenantId) {
        chat.chatName = chat.chatName
          ? `${chat.chatName}, ${element.name}`
          : element.name;
        chat.chatTitle = 'Group';
      }
    });
  }
}
