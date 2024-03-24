import {Component} from '@angular/core';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {InMailService} from '../shared/facade/in-mail.service';
import {environment} from '@vmsl/env/environment';
import {pageLimitMaxThousand} from '@vmsl/shared/model/items-per-page-list';
import {UserFacadeService} from '@vmsl/shared/facades/user-facade.service';
import {UserInfo} from '@vmsl/core/auth/models/user.model';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {ToastrService} from 'ngx-toastr';
import {PubNubAngular} from 'pubnub-angular2';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {MailHelper} from '../shared/utils';
import {DeleteMailComponent} from '../delete-mail/delete-mail.component';
import {NbDialogService} from '@nebular/theme';
import {EmailLoopModel} from '../shared/models/email-loop.model';

@Component({
  selector: 'vmsl-mailbox-sent',
  templateUrl: './sent.component.html',
  styleUrls: ['./sent.component.scss'],
})
export class MailboxSentComponent extends RouteComponentBase {
  constructor(
    private readonly router: Router,
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly inMailService: InMailService,
    private readonly userFacadeService: UserFacadeService,
    private readonly store: UserSessionStoreService,
    private readonly toastrService: ToastrService,
    private readonly ngxLoader: NgxUiLoaderService,
    private readonly pubnub: PubNubAngular,
    private readonly dialogService: NbDialogService,
  ) {
    super(route, location);
  }

  sentMails: EmailLoopModel[];
  selectedMailIds = [];
  importantSelectedMailsCount: number;
  nonImportantSelectedMailsCount: number;
  allMails: EmailLoopModel[];
  contacts: UserInfo[];
  filterType = '';
  currentPage = 1;
  pageSize = 0;
  pubnubListner: object;
  isImportantSelected: boolean;
  isUnreadSelected: boolean;
  isSelectAll: boolean;
  isSearched = false;
  filter = {
    userId: [],
  };

  itemsPerPageList = pageLimitMaxThousand;

  ngOnInit() {
    this.callListener();
    this.userFacadeService.getMyContacts().subscribe(contactsList => {
      const defaultPageSize = 10;
      this.pageSize = defaultPageSize;
      const count = 100;
      this.totalMailsCount = count;
      this.contacts = contactsList;
      this.contacts.push(this.store.getUser());
      this.getMails();
    });
  }

  viewMail(mail: EmailLoopModel) {
    this.router.navigate(['/main/mailbox/mail-view-loop/' + mail.id], {
      queryParams: {mailType: 'send'},
    });
  }

  callListener() {
    this.pubnubListner = {
      message: m => {
        const eventData = JSON.parse(m.message);
        if (eventData.notificationType === 'INMAIL') {
          this.getMails(null, false);
        }
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
      .getSentMails(
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
          this.selectedMailIds = [];
          this.importantSelectedMailsCount = 0;
          this.nonImportantSelectedMailsCount = 0;
          if (showSpinner) {
            this.ngxLoader.stop();
          }
          this.allMails = res.threads;
          this.getCombinedList();
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
      .getSentMails(
        0,
        this.pageSize,
        this.filter,
        this.isImportantSelected,
        this.isUnreadSelected,
      )
      .subscribe(resp => {
        this.totalMailsCount = resp.totalThreadsCount;
        this.unreadCount = resp.unreadCount;
        this.selectedMailIds = [];
        this.importantSelectedMailsCount = 0;
        this.nonImportantSelectedMailsCount = 0;
        if (showSpinner) {
          this.ngxLoader.stop();
        }
        this.allMails = resp.threads;
        this.getCombinedList();
        this.bindMailsBasedOnFilterType();
        if (typeof callback === 'function') {
          callback();
        }
      });
    this.currentPage = 1;
  }

  getCombinedList() {
    this.allMails.forEach(mail => {
      if (mail.to.length) {
        if (mail.to[0].id === this.store.getUser().id) {
          mail.combinedToList = mail.from.name;
        } else {
          const fullName = mail.to[0].name;
          if (mail.to?.length > 1) {
            mail.combinedToList = fullName + '...';
          } else {
            mail.combinedToList = fullName;
          }
        }
      }

      mail.fromName = mail.from ? mail.from.name : '';
    });
  }

  bindMailsBasedOnFilterType() {
    if (this.filterType === 'important') {
      this.sentMails = this.allMails.filter(mail => mail.isImportant);
    } else if (this.filterType === 'unread') {
      this.sentMails = this.allMails.filter(mail => mail.isNew);
    } else {
      this.sentMails = this.allMails;
    }
  }

  onMailFilterClick() {
    this.sentMails = MailHelper.filterMails(
      [...this.allMails],
      this.isImportantSelected,
      this.isUnreadSelected,
    );
  }

  onItemsPerPageChange() {
    this.getMails();
  }

  moveToTrash() {
    let ids = [];
    this.sentMails
      .filter(t => this.selectedMailIds.includes(t.id))
      .forEach(t => (ids = [...ids, ...t.messageIds]));
    this.inMailService.deleteMail(ids, 'send', 'trash').subscribe(res => {
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

  onSelectAll(val) {
    this.sentMails.forEach(mail => {
      if (mail.isSelected !== val) {
        mail.isSelected = val;
        this.onMailCheckUncheck(val, mail);
      }
    });
  }

  markImportant(isImportant) {
    const count = this.selectedMailIds.length;
    let ids = [];
    if (!isImportant) {
      this.sentMails
        .filter(t => this.selectedMailIds.includes(t.id))
        .forEach(t => (ids = ids.concat(t.messageIds)));
    } else {
      const selectedMails = this.sentMails.filter(t =>
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

  totalMailsCount = 0;
  unreadCount = 0;

  moveToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getMails();
    }
  }

  deleteMail() {
    this.dialogService.open(DeleteMailComponent, {
      context: {
        callback: this.moveToTrash.bind(this),
      },
    });
  }
}
