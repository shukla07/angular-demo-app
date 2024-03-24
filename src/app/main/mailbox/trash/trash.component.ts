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

@Component({
  selector: 'vmsl-mailbox-trash',
  templateUrl: './trash.component.html',
  styleUrls: ['./trash.component.scss'],
})
export class MailboxTrashComponent extends RouteComponentBase {
  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly inMailService: InMailService,
    private readonly userFacadeService: UserFacadeService,
    private readonly store: UserSessionStoreService,
    private readonly toastrService: ToastrService,
    private readonly router: Router,
    private readonly dialogService: NbDialogService,
  ) {
    super(route, location);
  }

  trashMails: EmailLoopModel[];
  selectedMailIds = [];
  importantSelectedMailsCount: number;
  nonImportantSelectedMailsCount: number;
  allMails: EmailLoopModel[];
  contacts: UserInfo[];
  filterType = '';
  currentPage = 1;
  pageSize = 0;
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

  getMailsByUserName() {
    this.isSearched = true;
    this.getMails();
  }

  getMails(callback = null) {
    if (!this.isSearched) {
      this.filter.userId = null;
    }

    this.inMailService
      .getTrashMails(
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
          this.allMails = res.threads;
          this.bindMailsBasedOnFilterType();
          this.getCombinedList();
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
      .getTrashMails(
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
        this.bindMailsBasedOnFilterType();
        this.getCombinedList();
        if (typeof callback === 'function') {
          callback();
        }
      });
    this.currentPage = 1;
  }

  getCombinedList() {
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

      mail.fromName = mail.from ? mail.from.name : '';
    });
  }

  bindMailsBasedOnFilterType() {
    if (this.filterType === 'important') {
      this.trashMails = this.allMails.filter(mail => mail.isImportant);
    } else if (this.filterType === 'unread') {
      this.trashMails = this.allMails.filter(mail => mail.isNew);
    } else {
      this.trashMails = this.allMails;
    }
  }

  onSelectAll(val) {
    this.trashMails.forEach(mail => {
      if (mail.isSelected !== val) {
        mail.isSelected = val;
        this.onMailCheckUncheck(val, mail);
      }
    });
  }

  onMailFilterClick() {
    this.trashMails = MailHelper.filterMails(
      [...this.allMails],
      this.isImportantSelected,
      this.isUnreadSelected,
    );
  }

  onItemsPerPageChange() {
    this.getMails();
  }

  viewMail(mail: EmailLoopModel) {
    this.router.navigate(['/main/mailbox/mail-view-loop/' + mail.id], {
      queryParams: {mailType: 'trash'},
    });
  }

  moveToTrash() {
    let ids = [];
    this.trashMails
      .filter(t => this.selectedMailIds.includes(t.id))
      .forEach(t => (ids = [...ids, ...t.messageIds]));
    this.inMailService.deleteMail(ids, 'trash', 'delete').subscribe(res => {
      this.getMails(() => {
        this.toastrService.success('Emails deleted permanently.', 'SUCCESS', {
          timeOut: environment.messageTimeout,
        });
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

  restoreMultipleMails() {
    let ids = [];
    const selectedMails = this.trashMails.filter(t =>
      this.selectedMailIds.includes(t.id),
    );
    ids = selectedMails.map(t => t.messageIds[t.messageIds.length - 1]);
    this.inMailService.restoreEmailFromTrash(ids).subscribe(res => {
      this.getMails(() => {
        this.toastrService.success(`Emails restored to inbox`, 'SUCCESS', {
          timeOut: environment.messageTimeout,
        });
      });
    });
  }

  restoreMail(mail: EmailLoopModel) {
    this.inMailService.restoreEmailFromTrash(mail.messageIds).subscribe(res => {
      this.getMails(() =>
        this.toastrService.success(`Email restored to inbox`, 'SUCCESS', {
          timeOut: environment.messageTimeout,
        }),
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
