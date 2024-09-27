import {
  Component,
  Input,
  QueryList,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { ComponentBase } from '@vmsl/core/component-base';
import * as _ from 'lodash';
import { PubNubAngular } from 'pubnub-angular2';
import { ChatFacadeService } from '../shared/chat-facade.service';
import { Chat } from '../shared/chat.model';
import { NbPopoverDirective } from '@nebular/theme';
import { UserSessionStoreService } from '@vmsl/core/store/user-session-store.service';
import * as moment from 'moment';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs';
import { RoleType } from '@vmsl/core/enums';

@Component({
  selector: 'vmsl-chat-listing',
  templateUrl: './chat-listing.component.html',
  styleUrls: ['./chat-listing.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChatListingComponent extends ComponentBase {
  @Input('chat')
  public set chat(value) {
    if (value) {
      if (value.channelId) {
        const chat = this.chatList.find(
          ele => ele.channelId === value.channelId,
        );
        if (chat) {
          chat.unreadCount = 0;
        }
      } else {
        this.chatList = [value, ...this.chatList];
      }
    }
  }
  @Input('removeChatfromList')
  public set removeChatfromList(value) {
    if (value) {
      if (value.teamId) {
        this.chatList = this.chatList.filter(
          ele => ele.teamId !== value.teamId,
        );
      } else {
        this.chatList = this.chatList.filter(
          ele => !_.isEqual(ele.participants, value.participants),
        );
      }
    }
  }
  @Input('chatWindowList') chatWindowList;
  @ViewChildren(NbPopoverDirective) popovers: QueryList<NbPopoverDirective>;

  chatList: Chat[] = [];
  skip = 0;
  totalChatCount: number;
  chatNameList: Observable<Chat[]>;
  userSearchStr = new Subject<string | null>();

  constructor(
    private readonly pubnub: PubNubAngular,
    private readonly chatFacade: ChatFacadeService,
    private readonly store: UserSessionStoreService,
  ) {
    super();
    this.userSearchStr.subscribe(res => {
      if (res) {
        this.getFilteredChatList(res);
      }
    });
  }

  ngOnInit() {
    super.ngOnInit();
    this.getAllChats();
    this.pubnubListner();
  }

  pubnubListner() {
    this.pubnub.addListener({
      message: m => {
        const chatData = JSON.parse(m.message);
        if (
          chatData.notificationType === 'Chat-Notif' &&
          Number(this.store.getUser().role) !== RoleType.hcp
        ) {
          if (this.chatList.find(ele => ele.channelId === chatData.channelId)) {
            this.sortChatList(chatData);
          } else {
            this.chatFacade
              .getAllChats(0, chatData.channelId)
              .subscribe(res => {
                if (res[0].teamChat) {
                  this.chatList = this.chatList.filter(
                    ele => ele.channelId !== chatData.channelId,
                  );
                } else {
                  this.matchReceivers(chatData);
                }
                this.chatList = [res[0], ...this.chatList];
              });
          }
        }
      },
    });
  }

  matchReceivers(data) {
    const ids = [];
    let chat;
    this.chatList.forEach(element => {
      element.participants.forEach(ele => {
        if (ele['userTenantId'] !== this.store.getUser().userTenantId) {
          ids.push(ele['userTenantId']);
        }
      });
      if (_.isEqual(ids, data.recievers)) {
        chat = element;
      }
    });
    this.chatList = this.chatList.filter(ele => ele !== chat);
  }

  sortChatList(chatData) {
    this.chatList.forEach((item, i) => {
      if (item.channelId === chatData.channelId) {
        if (
          !this.chatWindowList.find(
            ele => ele.channelId === chatData.channelId,
          ) &&
          chatData.userTenantId !== this.store.getUser().userTenantId
        ) {
          item.unreadCount = 1;
        }
        item.date = moment().format('LT');
        this.chatList.splice(i, 1);
        this.chatList.unshift(item);
      }
    });
  }

  getAllChats() {
    this.chatFacade.getAllChats(this.skip).subscribe(res => {
      if (Number(this.store.getUser().role) === RoleType.hcp) {
        res.forEach(chat => {
          if (
            chat.teamId &&
            chat.createdBy === this.store.getUser().userTenantId
          ) {
            this.chatList.push(chat);
          }
        });
      } else {
        this.chatList.push(...res);
      }
    });
  }

  getAllChatCount() {
    this.chatFacade.getChatsCount().subscribe(res => {
      this.totalChatCount = res['count'];
    });
  }

  getFilteredChatList(searchTerm: string) {
    this.chatNameList = this.chatFacade.getFilteredChatList(searchTerm);
  }

  answer(data: Chat) {
    data.unreadCount = 0;
    this.chatFacade.setChatId(data);
    this.popovers.forEach(pop => {
      pop.hide();
    });
  }

  onScrollDown() {
    this.skip += 50;
    this.getAllChats();
  }

  onSerach(data) {
    this.chatFacade.setChatId(data);
  }
}
