import { UserInfo } from '@vmsl/core/auth/models/user.model';
import { Message } from '../message.model';

export class Chat {
  from: string;
  message: Message;
  channelId: string;
  date: string;
  participants: Object[] = [];
  addParticipants: UserInfo[];
  chatName: string;
  chatTitle: string;
  chatProfile: string;
  unreadCount: number;
  teamChat: boolean;
  teamName: string;
  teamId: string;
  participantsString: string;
  hcpName: string;
  createdBy: string;
  constructor() {
    this.message = new Message();
  }
}
