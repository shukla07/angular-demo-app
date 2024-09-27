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
import {MailHelper} from '../shared/utils';
import {DeleteMailComponent} from '../delete-mail/delete-mail.component';
import {NbDialogService} from '@nebular/theme';
import {EmailLoopModel} from '../shared/models/email-loop.model';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'vmsl-mailbox-important',
  templateUrl: './important.component.html',
  styleUrls: ['./important.component.scss'],
})
export class MailboxImportantComponent extends RouteComponentBase {
  constructor(
    protected readonly route: ActivatedRoute,
    private readonly router: Router,
    protected readonly location: Location,
    private readonly inMailService: InMailService,
    private readonly userFacadeService: UserFacadeService,
    private readonly store: UserSessionStoreService,
    private readonly toastrService: ToastrService,
    private readonly dialogService: NbDialogService,
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
  searchText = '';
  itemsPerPageList = pageLimitMaxThousand;
  isImportantSelected: boolean;
  isUnreadSelected: boolean;
  isSelectAll: boolean;
  isSearched = false;
  filter = {
    userId: [],
  };

  ngOnInit() {
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
      queryParams: {mailType: 'important'},
    });
  }

  getMailsByUserName() {
    this.isSearched = true;
    this.getMails();
  }

  getMails(callback = null) {
    if (!this.isSearched) {
      this.filter.userId = null;
    }

    this.inMailService
      .getImportantMails(
        this.pageSize * (this.currentPage - 1),
        this.pageSize,
        this.filter,
        this.isImportantSelected,
        this.isUnreadSelected,
      )
      .subscribe(res => {
        if (res.threads.length) {
          this.totalMailsCount = res.totalThreadsCount;
          this.unreadCount = res.unreadCount;
          this.selectedMailIds = [];
          this.importantSelectedMailsCount = 0;
          this.nonImportantSelectedMailsCount = 0;
          this.allMails = res.threads;
          this.getCombinedLists();
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
      .getImportantMails(
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
        this.allMails = resp.threads;
        this.getCombinedLists();
        this.bindMailsBasedOnFilterType();
        if (typeof callback === 'function') {
          callback();
        }
      });
    this.currentPage = 1;
  }

  getCombinedLists() {
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

      if (mail.from && mail.from.id === this.store.getUser().id) {
        const fullName = mail.to[0].name;
        if (mail.to?.length > 1) {
          mail.fromName = fullName + '...';
        } else {
          mail.fromName = fullName;
        }
      } else {
        mail.fromName = mail.from ? mail.from.name : '';
      }
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

  bindMailsBasedOnFilterType() {
    if (this.filterType === 'important') {
      this.inboxMails = this.allMails.filter(mail => mail.isImportant);
    } else if (this.filterType === 'unread') {
      this.inboxMails = this.allMails.filter(mail => mail.isNew);
    } else {
      this.inboxMails = this.allMails;
    }
  }

  onMailFilterClick() {
    this.inboxMails = MailHelper.filterMails(
      [...this.allMails],
      this.isImportantSelected,
      this.isUnreadSelected,
    );
  }

  onItemsPerPageChange() {
    this.getMails();
  }

  moveToTrash() {
    const selectedMails = this.inboxMails.filter(t =>
      this.selectedMailIds.includes(t.id),
    );
    let selectedMessages = [];
    selectedMails.forEach(t => {
      selectedMessages = [...selectedMessages, ...t.messages];
    });
    const inboxMessageIds = selectedMessages
      .filter(m => m.storage === 'inbox')
      ?.map(m => m.id);
    const sentMessageIds = selectedMessages
      .filter(m => m.storage === 'send')
      ?.map(m => m.id);
    const draftMessageIds = selectedMessages
      .filter(m => m.storage === 'draft')
      ?.map(m => m.id);
    const trashMessageIds = selectedMessages
      .filter(m => m.storage === 'trash')
      ?.map(m => m.id);

    const deleteMailFncList = [];
    if (inboxMessageIds?.length) {
      deleteMailFncList.push(
        this.inMailService.deleteMail(inboxMessageIds, 'inbox', 'trash'),
      );
    }
    if (sentMessageIds?.length) {
      deleteMailFncList.push(
        this.inMailService.deleteMail(sentMessageIds, 'send', 'trash'),
      );
    }
    if (draftMessageIds?.length) {
      deleteMailFncList.push(
        this.inMailService.deleteMail(draftMessageIds, 'draft', 'delete'),
      );
    }
    if (trashMessageIds?.length) {
      deleteMailFncList.push(
        this.inMailService.deleteMail(trashMessageIds, 'trash', 'delete'),
      );
    }
    forkJoin(deleteMailFncList).subscribe(response => {
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
