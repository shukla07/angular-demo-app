import {Component} from '@angular/core';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {environment} from '@vmsl/env/environment';
import {pageLimitMaxThousand} from '@vmsl/shared/model/items-per-page-list';
import {UserFacadeService} from '@vmsl/shared/facades/user-facade.service';
import {ToastrService} from 'ngx-toastr';
import {PubNubAngular} from 'pubnub-angular2';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {NbDialogService} from '@nebular/theme';
import {InMailService} from '../shared/facade/in-mail.service';
import {EmailModel} from '../shared/models/email.model';
import {DeleteMailComponent} from '../delete-mail/delete-mail.component';
import {EmailLoopModel} from '../shared/models/email-loop.model';
import {UserInfo} from '@vmsl/core/auth/models/user.model';
import {CommonService} from '@vmsl/shared/facades/common.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';

@Component({
  selector: 'vmsl-mailbox-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss'],
})
export class MailboxInboxComponent extends RouteComponentBase {
  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly pubnub: PubNubAngular,
    private readonly inMailService: InMailService,
    private readonly userFacadeService: UserFacadeService,
    private readonly toastrService: ToastrService,
    private readonly router: Router,
    private readonly ngxLoader: NgxUiLoaderService,
    private readonly dialogService: NbDialogService,
    private readonly commonService: CommonService,
    private readonly store: UserSessionStoreService,
  ) {
    super(route, location);
  }

  inboxMails: EmailLoopModel[];
  selectedMailIds = [];
  importantSelectedMailsCount: number;
  nonImportantSelectedMailsCount: number;
  allMails: EmailLoopModel[];
  contacts: UserInfo[];
  filterType = '';
  currentPage = 1;
  pageSize = 0;
  itemsPerPageList = pageLimitMaxThousand;
  pubnubListner: object;
  isImportantSelected: boolean;
  isUnreadSelected: boolean;
  isSelectAll: boolean;
  isSearched = false;
  filter = {
    userId: [],
  };

  ngOnInit() {
    this.callListener();
    const defaultPageSize = 10;
    this.pageSize = defaultPageSize;
    const count = 100;
    this.totalMailsCount = count;
    this.userFacadeService.getMyContacts().subscribe(contactsList => {
      this.contacts = contactsList;
      this.getMails();
    });
  }

  viewMail(mail: EmailModel) {
    this.router.navigate(['/main/mailbox/mail-view-loop/' + mail.id], {
      queryParams: {mailType: 'inbox'},
    });
  }

  callListener() {
    this.pubnubListner = {
      message: m => {
        this.getMails(null, false);
      },
    };
    this.pubnub.addListener(this.pubnubListner);
  }

  getMailsByUserName() {
    this.isSearched = true;
    this.getMails();
  }

  getMails(callback = null, showSpinner = true) {
    if (showSpinner) {
      this.ngxLoader.start();
    }
    if (!this.isSearched) {
      this.filter.userId = null;
    }
    this.inMailService
      .getInboxMails(
        this.pageSize * (this.currentPage - 1),
        this.pageSize,
        this.filter,
        this.isImportantSelected,
        this.isUnreadSelected,
      )
      .subscribe(res => {
        if (res.totalThreadsCount && res.threads.length) {
          this.totalMailsCount = res.totalThreadsCount;
          this.unreadCount = res.unreadCount;
          if (!this.unreadCount) {
            this.commonService.setUnreadCount(false);
          }
          this.selectedMailIds = [];
          this.importantSelectedMailsCount = 0;
          this.nonImportantSelectedMailsCount = 0;
          if (showSpinner) {
            this.ngxLoader.stop();
          }
          this.allMails = res.threads;
          this.bindRecipientsList();
          this.bindMailsBasedOnFilterType();
          if (typeof callback === 'function') {
            callback();
          }
        } else {
          //This is called when the offset is greater than or equal to the total number of items.
          this.getMailsIfNotFound();
        }
      });
  }

  getMailsIfNotFound(callback = null, showSpinner = true) {
    this.inMailService
      .getInboxMails(
        0,
        this.pageSize,
        this.filter,
        this.isImportantSelected,
        this.isUnreadSelected,
      )
      .subscribe(res => {
        this.totalMailsCount = res.totalThreadsCount;
        this.unreadCount = res.unreadCount;
        if (!this.unreadCount) {
          this.commonService.setUnreadCount(false);
        }
        this.selectedMailIds = [];
        this.importantSelectedMailsCount = 0;
        this.nonImportantSelectedMailsCount = 0;
        if (showSpinner) {
          this.ngxLoader.stop();
        }
        this.allMails = res.threads;
        this.bindRecipientsList();
        this.bindMailsBasedOnFilterType();
        if (typeof callback === 'function') {
          callback();
        }
      });
    this.currentPage = 1;
  }

  bindRecipientsList() {
    this.allMails.forEach(mail => {
      mail.combinedToList = mail.to.length
        ? mail.to.map(user => user.name).join(', ')
        : '';
      mail.combinedCcList = mail.cc.length
        ? mail.cc.map(user => user.name).join(', ')
        : '';
      mail.combinedCcList = mail.bcc.length
        ? mail.bcc.map(user => user.name).join(', ')
        : '';

      if (mail.messages[0].externalMetaData['forwarded']) {
        mail.fromName = mail.from ? mail.from.name : '';
      } else {
        let latestMessage = mail.messages.pop();
        if (
          this.store.getUser().id === latestMessage.externalMetaData['from'].id
        ) {
          latestMessage = mail.messages.pop();
        }
        mail.fromName = latestMessage.externalMetaData['from']
          ? latestMessage.externalMetaData['from'].name
          : '';
      }
    });
  }

  bindMailsBasedOnFilterType() {
    if (this.filterType === 'important') {
      this.inboxMails = this.allMails.filter(mail => mail.isImportant);
    } else if (this.filterType === 'unread') {
      this.inboxMails = this.allMails.filter(mail => mail.isNew);
    } else {
      this.inboxMails = this.allMails;
    }
  }

  onItemsPerPageChange() {
    this.getMails();
  }

  moveToTrash() {
    let ids = [];
    this.inboxMails
      .filter(t => this.selectedMailIds.includes(t.id))
      .forEach(t => (ids = [...ids, ...t.messageIds]));
    this.inMailService.deleteMail(ids, 'inbox', 'trash').subscribe(res => {
      this.getMails(() => {
        this.toastrService.success(
          'Emails moved to trash successfully',
          'SUCCESS',
          {
            timeOut: environment.messageTimeout,
          },
        );
      });
    });
  }

  onSelectAll(val) {
    this.inboxMails.forEach(mail => {
      if (mail.isSelected !== val) {
        mail.isSelected = val;
        this.onMailCheckUncheck(val, mail);
      }
    });
  }

  onMailCheckUncheck(val, mail: EmailLoopModel) {
    if (val) {
      if (mail.isImportant) {
        this.importantSelectedMailsCount++;
      } else {
        this.nonImportantSelectedMailsCount++;
      }
      this.selectedMailIds.push(mail.id);
    } else {
      if (mail.isImportant) {
        this.importantSelectedMailsCount--;
      } else {
        this.nonImportantSelectedMailsCount--;
      }
      if (
        this.selectedMailIds?.length &&
        this.selectedMailIds.indexOf(mail.id) > -1
      ) {
        this.selectedMailIds.splice(this.selectedMailIds.indexOf(mail.id), 1);
      }
    }
  }

  markImportant(isImportant) {
    const count = this.selectedMailIds.length;
    let ids = [];
    if (!isImportant) {
      this.inboxMails
        .filter(t => this.selectedMailIds.includes(t.id))
        .forEach(t => (ids = ids.concat(t.messageIds)));
    } else {
      const selectedMails = this.inboxMails.filter(t =>
        this.selectedMailIds.includes(t.id),
      );
      ids = selectedMails.map(t => t.messageIds[t.messageIds.length - 1]);
    }
    this.inMailService.markImportant(ids, isImportant).subscribe(res => {
      this.getMails(() => {
        this.toastrService.success(
          `Email${count > 1 ? 's' : ''} marked as ${
            isImportant ? '' : 'not'
          } important`,
          'SUCCESS',
          {
            timeOut: environment.messageTimeout,
          },
        );
      });
    });
  }

  markMailImportant(mail: EmailLoopModel) {
    this.inMailService
      .markImportant(mail.messageIds, !mail.isImportant)
      .subscribe(res => {
        mail.isImportant = !mail.isImportant;
        this.toastrService.success(
          `Email marked as ${mail.isImportant ? '' : 'not'} important`,
          'SUCCESS',
          {
            timeOut: environment.messageTimeout,
          },
        );
      });
  }

  moveToPage(number) {
    this.currentPage = number;
    this.getMails();
  }

  moveToNextPage() {
    this.currentPage++;
    this.getMails();
  }

  deleteMail() {
    this.dialogService.open(DeleteMailComponent, {
      context: {
        callback: this.moveToTrash.bind(this),
      },
    });
  }

  totalMailsCount = 0;
  unreadCount = 0;

  moveToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getMails();
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.pubnub.removeListener(this.pubnubListner);
  }
}
