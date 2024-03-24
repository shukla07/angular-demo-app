import {
  Component,
  Input,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
  EventEmitter,
  ElementRef,
} from '@angular/core';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {Chat} from '../shared/chat.model';
import {ChatFacadeService} from '../shared/chat-facade.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {PubNubAngular} from 'pubnub-angular2';
import {Message} from '../message.model';
import {UserFacadeService} from '@vmsl/shared/facades/user-facade.service';
import {UserInfo} from '@vmsl/core/auth/models/user.model';
import {
  NbDialogModule,
  NbDialogRef,
  NbDialogService,
  NbPopoverDirective,
} from '@nebular/theme';
import {ContentPopupComponent} from '../../../shared/components/content-popup/content-popup.component';
import * as _ from 'lodash';
import {ToastrService} from 'ngx-toastr';
import {environment} from '@vmsl/env/environment';
import {forkJoin} from 'rxjs';
import * as moment from 'moment';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {CommonService} from '@vmsl/shared/facades/common.service';
import {ContentType} from '@vmsl/core/enums';

// model for image preview
export class Image {
  url: string;
  type: boolean;
  fileData?: File;
  isContent? = false;
  fileKey?: string;
}

@Component({
  selector: 'vmsl-chat-windows',
  templateUrl: './chat-windows.component.html',
  styleUrls: ['./chat-windows.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChatWindowsComponent extends RouteComponentBase {
  @Input('chatData')
  public set chatData(val) {
    if (val) {
      this.startChat(val);
    }
  }
  @Output('close') close = new EventEmitter<Object>();
  @ViewChild('exportChat', {read: TemplateRef})
  exportChat: TemplateRef<NbDialogModule>;
  @ViewChildren(NbPopoverDirective) popovers: QueryList<NbPopoverDirective>;
  dialogRef: NbDialogRef<NbDialogModule>;
  chatOpen = true;
  allUsers: UserInfo[];
  messages: Message[] = [];
  chat: Chat;
  pubnubObject;
  addUser: UserInfo[];
  multiUserView = false;
  profileObject = {};
  images: Image[] = [];
  contentAttachment = [];
  skip = 0;
  scroll = true;
  showLoadMoreButton = false;
  newMsg: string;
  exportChatModel = {
    toDate: moment().toISOString(),
    startDate: moment().subtract(1, 'days').toISOString(),
  };
  exportChatDialog: NbDialogRef<NbDialogModule>;
  oldScroll = 0;
  typing: string;
  permissionKey = Permission;
  canChat = true;
  showContent = this.store
    .getUser()
    .permissions.includes('ContentModuleAllowed');
  inputFieldClass = '.chat-input';
  scrollClass = '.chat-body .scrollable';
  uploading = false;
  unread = false;

  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly chatFacade: ChatFacadeService,
    private readonly store: UserSessionStoreService,
    private readonly pubnub: PubNubAngular,
    private readonly userFacade: UserFacadeService,
    private readonly dialogService: NbDialogService,
    private readonly toasterService: ToastrService,
    private readonly el: ElementRef,
    private readonly commonService: CommonService,
  ) {
    super(route, location);
    this._subscriptions.push(
      this.commonService.contentInChatObv.subscribe(resp => {
        if (resp) {
          this.contentAttachment = resp;
          this.attachContent();
        }
      }),
    );
  }

  ngOnInit() {
    super.ngOnInit();
    this.pubnubListner();
    this.userFacade.getMyContacts().subscribe(res => {
      this.allUsers = res.map(ele => {
        const user = new UserInfo();
        user.firstName = ele.firstName;
        user.lastName = ele.lastName;
        user.userTenantId = ele.userTenantId;
        user.userTitle = ele.userTitle;
        user.photoUrl = ele.photoUrl;
        return user;
      });
      this.allUsers = this.allUsers.filter(ele => {
        return !this.chat.participants.some(
          participant => ele.userTenantId === participant['userTenantId'],
        );
      });
    });
  }

  sendMessage() {
    if (!this.images.length && !this.newMsg) {
      return;
    }
    const text = this.newMsg;
    const attchments = [...this.images];
    const elements = this.el.nativeElement as HTMLElement;
    const chatInput = elements.querySelectorAll(this.inputFieldClass);
    chatInput.forEach(element => {
      element.innerHTML = '';
    });
    // to get chat scroll Value
    const cssElement = elements.querySelectorAll(this.scrollClass);
    // to scrollTop chat
    cssElement.forEach(element => {
      element.scrollTop = element.scrollHeight;
    });
    if (this.uploading) {
      const msg = new Message();
      msg.text = text.trim();
      this.chat.message = msg;
      this.sendMessageApi();
    } else {
      if (attchments.length) {
        this.uploadDocument(text, attchments);
      } else {
        const msg = new Message();
        msg.text = text.trim();
        this.chat.message = msg;
        this.sendMessageApi();
      }
    }
  }

  startChat(data) {
    this.chat = data;
    this.chat.participants.forEach(participant => {
      this.profileObject[participant['userTenantId']] = participant['imageKey'];
    });
    if (data.channelId) {
      this.chatFacade.getChatById(data, this.skip).subscribe(res => {
        this.canChat = res[0].canChat;
        const maxMsgs = 45;
        this.messages = res.reverse();
        if (this.messages.length > maxMsgs) {
          this.showLoadMoreButton = true;
        }
        if (this.chat.channelId) {
          this.chatFacade.markConversation(this.chat).subscribe();
        }
        this.pubnub.subscribe({
          channels: [data.channelId],
        });
      });
    }
  }

  getLaterChat() {
    this.skip += 50;
    // to get chat scroll Value
    const elements = this.el.nativeElement as HTMLElement;
    const cssElement = elements.querySelectorAll(this.scrollClass);
    // to get old chat scroll value
    cssElement.forEach(element => {
      this.oldScroll = element.scrollHeight;
    });
    this.chatFacade.getChatById(this.chat, this.skip).subscribe(res => {
      if (!res.length) {
        this.showLoadMoreButton = false;
      }
      this.scroll = false;
      this.messages.unshift(...res.reverse());
      // to get new scroll value
      try {
        const scrollTime = 100;
        setTimeout(() => {
          cssElement.forEach(element => {
            const newScroll = element.scrollHeight;

            // to set final scroll value
            const finalScroll = newScroll - this.oldScroll;
            element.scrollTop = finalScroll;
          });
        }, scrollTime);
      } catch (err) {
        // sonarignore:start
        console.log(err);
        // sonarignore:end
      }
    });
  }

  pubnubListner() {
    this.pubnubObject = {
      message: m => {
        const callData = JSON.parse(m.message);
        if (callData.notificationType === 'Chat-Notif' && this.chat.teamChat) {
          if (
            callData.channelId === this.chat.channelId ||
            (callData.hcpId === this.store.getUser().userTenantId &&
              callData.teamId === this.chat.teamId)
          ) {
            this.pushMessage(callData);
          }
        } else {
          if (
            callData.notificationType === 'Chat-Notif' &&
            (callData.channelId === this.chat.channelId ||
              this.matchReceivers(callData))
          ) {
            this.pushMessage(callData);
          }
        }
      },
      signal: s => {
        if (
          s.message !==
          `${this.store.getUser().firstName} ${this.store.getUser().lastName}`
        ) {
          this.typing = `${s.message} is typing`;
          const clearInterval = 900; //0.9 seconds
          let clearTimerId: NodeJS.Timeout;
          clearTimeout(clearTimerId);
          clearTimerId = setTimeout(() => {
            this.typing = '';
          }, clearInterval);
        }
      },
    };
    this.pubnub.addListener(this.pubnubObject);
  }

  pushMessage(callData) {
    if (!this.chat.channelId) {
      this.pubnub.subscribe({
        channels: [callData.channelId],
      });
    }
    if (this.chat.channelId) {
      this.chatFacade.markConversation(this.chat).subscribe();
    }
    this.messages.push({
      text: JSON.parse(callData.message).body,
      date: new Date(),
      reply:
        callData.userTenantId === this.store.getUser().userTenantId
          ? true
          : false,
      type: JSON.parse(callData.attachment)?.length ? 'file' : 'text',
      files: JSON.parse(callData.attachment)?.length
        ? JSON.parse(callData.attachment).map(element => {
            return {
              url: element.key,
              type: element.mime,
              icon: 'file-text-outline',
            };
          })
        : [],
      user: {
        name:
          callData.sender ===
          `${this.store.getUser().firstName} ${this.store.getUser().lastName}`
            ? null
            : callData.sender,
        avatar: this.store.getUser().photoUrl,
      },
    });
    if (!this.chatOpen) {
      this.unread = true;
    }
  }

  matchReceivers(data) {
    const ids = [];
    this.chat.participants.forEach(ele => {
      if (ele['userTenantId'] !== this.store.getUser().userTenantId) {
        ids.push(ele['userTenantId']);
      }
    });
    return _.isEqual(ids, data.recievers);
  }

  closeChat() {
    this.close.emit(this.chat);
  }

  addParticipants() {
    const chat = new Chat();
    chat.addParticipants = this.addUser;
    chat.participants = this.chat.participants;
    chat.date = moment().format('LT');
    this.chatFacade.setChatId(chat);
    this.close.emit(this.chat);
  }

  openAddParticipant() {
    this.popovers.forEach(pop => {
      pop.show();
    });
  }
  closeAddParticipant() {
    this.addUser = [];
    this.popovers.forEach(pop => {
      pop.hide();
    });
  }

  openExportChat() {
    this.exportChatDialog = this.dialogService.open(this.exportChat, {
      closeOnBackdropClick: false,
    });
  }
  addContent() {
    this.dialogRef = this.dialogService.open(ContentPopupComponent, {
      closeOnBackdropClick: false,
      context: {inMail: false},
    });
  }

  ngAfterViewInit() {
    // for chat load more button show hide on scroll start
    const elements = this.el.nativeElement as HTMLElement;
    const cssElement = elements.querySelectorAll(this.scrollClass);
    const chatBody = elements.querySelectorAll('.chat-body');

    cssElement.forEach(element => {
      element.addEventListener('scroll', e => {
        if (e.target['scrollTop'] <= 0) {
          e.target['classList'].add('load-btn');
          chatBody.forEach(elmnt => {
            elmnt.classList.add('chat-load-btn');
          });
        } else {
          e.target['classList'].remove('load-btn');
          chatBody.forEach(elmnt => {
            elmnt.classList.remove('chat-load-btn');
          });
        }
      });
    });
    // for chat load more button show hide on scroll end
  }

  uploadFile(event) {
    const maxFiles = 4;
    if (event.target.files.length) {
      if (this.images.length + event.target.files.length > maxFiles) {
        this.toasterService.error(
          'You can only send 4 documents at a time',
          'Error',
          {
            timeOut: environment.messageTimeout,
          },
        );
        return;
      }
      const files = [...event.target.files];
      event.target.value = '';
      for (const file of files) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.images.push({
            url: e.target.result,
            type: file.type.includes('image'),
            fileData: file,
            isContent: false,
          });
        };
        reader.readAsDataURL(file);
      }
    }
  }

  onRemove(event) {
    this.images.splice(this.images.indexOf(event), 1);
  }

  uploadDocument(text, attchments) {
    this.uploading = true;
    const uploadFilesObv = [];
    const contentList = [];
    attchments.forEach(file => {
      if (!file.isContent) {
        uploadFilesObv.push(this.chatFacade.uploadDocuments(file.fileData));
      } else {
        contentList.push({
          key: file.fileKey,
          mime: 'N/A',
          name: 'N/A',
          size: 'N/A',
          url: file.url,
        });
      }
    });
    if (uploadFilesObv.length) {
      forkJoin(uploadFilesObv).subscribe(responseArr => {
        const msg = new Message();
        msg.text = text && text.trim();
        msg.files = responseArr.concat(contentList);
        this.chat.message = msg;
        this.sendMessageApi();
      });
    } else {
      const msg = new Message();
      msg.text = text && text.trim();
      msg.files = contentList;
      this.chat.message = msg;
      this.sendMessageApi();
    }
  }

  sendMessageApi() {
    this.chatFacade.sendMessage(this.chat).subscribe(res => {
      this.chat.channelId = res.message['channelId'];
      this.uploading = false;
      this.images = [];
    });
  }

  attachContent() {
    const maxFiles = 4;
    if (this.contentAttachment.length > maxFiles) {
      this.toasterService.error(
        'You can only attach 4 content documents at a time',
        'Error',
        {
          timeOut: environment.messageTimeout,
        },
      );
      this.commonService.setContentInChat(null);
      return;
    }
    if (this.contentAttachment?.length && this.images.length) {
      this.images = this.images.filter(item => item.isContent === false);
    }
    this.contentAttachment.forEach(res => {
      this.images.push({
        url: res.fileUrl,
        type: res.fileType === ContentType.image ? true : false,
        isContent: true,
        fileKey: res.fileKey,
      });
    });
    this.dialogRef.close();
    this.commonService.setContentInChat(null);
  }

  sendTypingSignal() {
    let canPublish = true;

    if (canPublish && this.chat.channelId) {
      this.chatFacade.sendTypingSignal(this.chat).subscribe();
      canPublish = false;

      const throttleTime = 200;
      setTimeout(() => {
        canPublish = true;
      }, throttleTime);
    }
  }

  export() {
    this.chatFacade
      .exportChat(
        this.chat.channelId,
        this.exportChatModel.startDate,
        this.exportChatModel.toDate,
      )
      .subscribe(resp => {
        const downloadLink = document.createElement('a');
        downloadLink.href = resp['fileUrl'];
        downloadLink.download = 'download';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        this.exportChatDialog.close();
      });
  }

  // chat input feild Submit on press enter
  onEnter($event) {
    $event.preventDefault();
    this.sendMessage();
  }
}
