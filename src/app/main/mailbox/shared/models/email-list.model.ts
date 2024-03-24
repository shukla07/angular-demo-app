import {EmailLoopModel} from './email-loop.model';

export class EmailListModel {
  threads: EmailLoopModel[];
  totalThreadsCount: number;
  unreadCount: number;
}
