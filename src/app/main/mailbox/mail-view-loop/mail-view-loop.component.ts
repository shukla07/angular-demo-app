import {
  Component,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {NbDialogModule, NbDialogRef, NbDialogService} from '@nebular/theme';
import {EmailModel} from '../shared/models/email.model';
import {InMailConfig} from '../shared/in-mail.config';
import {EmailLoopModel} from '../shared/models/email-loop.model';
import {InMailService} from '../shared/facade/in-mail.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {UserFacadeService} from '@vmsl/shared/facades/user-facade.service';
import {UserInfo} from '@vmsl/core/auth/models/user.model';
import {MailHelper} from '../shared/utils';
import {ToastrService} from 'ngx-toastr';
import {environment} from '@vmsl/env/environment';
import {DeleteMailComponent} from '../delete-mail/delete-mail.component';
import {NameId} from '@vmsl/core/models';
import {CommonService} from '@vmsl/shared/facades/common.service';
import {MailboxComposeEmailComponent} from '../compose-email/compose-email.component';

@Component({
  selector: 'vmsl-mailbox-mail-view-loop',
  templateUrl: './mail-view-loop.component.html',
  styleUrls: ['./mail-view-loop.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MailboxMailViewLoopComponent extends RouteComponentBase {
  mailViewId;
  composeEmail = new EmailModel();
  dialogRef: NbDialogRef<NbDialogModule>;
  mailLoopModel = new EmailLoopModel();
  isReply = false;
  isForward = false;
  mailType;
  replyOrForwardMail: EmailModel = new EmailModel();
  isAttrachmentDownloading = false;
  currentUserId: string;

  inMailConfig = InMailConfig;
  contacts: UserInfo[];

  editorConfig = this.inMailConfig.editorConfig;
  @ViewChild('composeReply') composeReply: MailboxComposeEmailComponent;
  constructor(
    private readonly router: Router,
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly inMailService: InMailService,
    private readonly dialogService: NbDialogService,
    private readonly store: UserSessionStoreService,
    private readonly userFacadeService: UserFacadeService,
    private readonly toastrService: ToastrService,
    private readonly commonService: CommonService,
  ) {
    super(route, location);
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.mailViewId = params.get('id');
    });
    this.mailType = this.getQueryParam('mailType');
    this.userFacadeService.getMyContacts().subscribe(contactsList => {
      this.contacts = contactsList;
      this.contacts.push(this.store.getUser());
      this.getCurrentMail();
    });
    this.currentUserId = this.store.getUser().id;
    this.commonService.emailIdObv.subscribe(resp => {
      if (resp) {
        this.mailViewId = resp;
        this.getCurrentMail();
      }
    });
  }

  onSelect(event) {
    this.composeEmail.files.push(...event.addedFiles);
  }

  onRemove(event) {
    this.composeEmail.files.splice(this.composeEmail.files.indexOf(event), 1);
  }

  openLinkContent(dialog: TemplateRef<NbDialogModule>) {
    this.dialogRef = this.dialogService.open(dialog);
  }

  onDiscardDraftedMail = () => {
    this.isReply = false;
    this.isForward = false;
    this.replyOrForwardMail = new EmailModel();
  };

  replyToMail = mail => {
    mail.status = 'send';
    mail.to = this.composeReply.toField.selectedValues.map(user => {
      return {
        name: user['fullName'],
        id: user['id'],
      };
    });
    if (this.composeReply.bccField) {
      mail.bcc = this.composeReply.bccField.selectedValues.map(ele => {
        return {
          name: ele['fullName'],
          id: ele['id'],
        };
      });
    }
    if (this.composeReply.ccField) {
      mail.cc = this.composeReply.ccField.selectedValues.map(item => {
        return {
          name: item['fullName'],
          id: item['id'],
        };
      });
    }
    this.inMailService.replyToMessage(mail).subscribe(res => {
      this.toastrService.success('Reply sent successfully', 'SUCCESS', {
        timeOut: environment.messageTimeout,
      });
      this.isReply = false;
      this.getCurrentMail();
    });
  };

  forwardMail = (mail: EmailModel) => {
    this.inMailService.forwardMail(mail).subscribe(res => {
      this.toastrService.success('Email forwarded successfully', 'SUCCESS', {
        timeOut: environment.messageTimeout,
      });
      this.isForward = false;
      this.getCurrentMail();
    });
  };

  markImportant(mail: EmailModel) {
    this.inMailService
      .markImportant([mail.id], !mail.isImportant)
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

  onForwardClick(mail: EmailModel) {
    this.isReply = false;
    this.isForward = true;
    this.replyOrForwardMail = new EmailModel();
    this.replyOrForwardMail.formattedTime = mail.formattedTime;
    this.replyOrForwardMail.subject = 'FW: ' + mail.subject;
    this.replyOrForwardMail.htmlContent = MailHelper.getForwardBody(mail);
    this.replyOrForwardMail.messageId = mail.id;
    this.replyOrForwardMail.uploadedAttachmentsInfo =
      mail.uploadedAttachmentsInfo && mail.uploadedAttachmentsInfo.length
        ? mail.uploadedAttachmentsInfo
        : [];
  }

  onReplyClick(mail: EmailModel) {
    this.populateReplyMailFields(mail, false);
  }

  populateReplyMailFields(mail, isReplyAll) {
    Object.assign(this.replyOrForwardMail, mail);
    this.replyOrForwardMail = {...mail};

    if (mail.from.id === this.store.getUser().id) {
      this.replyOrForwardMail.to = mail.to;
    } else {
      this.replyOrForwardMail.to = [mail.from];
      if (isReplyAll && mail.to.length > 1) {
        mail.to.forEach(recipient => {
          if (recipient.id !== this.store.getUser().id) {
            this.replyOrForwardMail.to.push(recipient);
          }
        });
      }
    }
    this.replyOrForwardMail.from = new NameId({
      id: this.store.getUser().id,
      name: `${this.store.getUser().firstName} ${
        this.store.getUser().lastName
      }`,
    });
    this.replyOrForwardMail.cc = isReplyAll ? mail.cc : [];
    this.replyOrForwardMail.bcc = [];
    this.isReply = true;
    this.isForward = false;
    this.replyOrForwardMail.htmlContent = MailHelper.getForwardBody(mail);
  }

  onReplyAllClick(mail: EmailModel) {
    this.populateReplyMailFields(mail, true);
  }

  getImageUrl(attachment) {
    this._subscriptions.push(
      this.inMailService.getSignedUrl(attachment.path).subscribe(resp => {
        attachment['imageUrl'] = resp['url'];
      }),
    );
  }

  downloadAttachment(mail) {
    this.isAttrachmentDownloading = true;
    const downloadLink = document.createElement('a');
    downloadLink.href = mail.imageUrl;
    downloadLink.download = 'download';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    this.isAttrachmentDownloading = false;
  }

  viewAttachment(url) {
    window.open(url);
  }

  getCurrentMail() {
    if (this.mailType !== 'trash') {
      this.inMailService.getMailById(this.mailViewId).subscribe(res => {
        this.bindMail(res);
      });
    } else {
      this.inMailService.getTrashMailById(this.mailViewId).subscribe(res => {
        this.bindMail(res);
      });
    }
  }

  bindMail(res) {
    this.mailLoopModel = res;
    this.mailLoopModel.messages.forEach(mail => {
      mail.combinedToList = mail.to.length
        ? mail.to.map(user => user.name).join(', ')
        : '';
      mail.combinedCcList = mail.cc.length
        ? mail.cc.map(user => user.name).join(', ')
        : '';
      mail.combinedBccList = mail.bcc.length
        ? mail.bcc.map(user => user.name).join(', ')
        : '';
      mail.fromName = mail.from ? mail.from.name : '';
    });
    this.checkIfAttachments(res);
  }

  checkIfAttachments(mail: EmailLoopModel) {
    // will check if we have url to the attachements.
    mail.messages.forEach(message => {
      if (
        message.uploadedAttachmentsInfo &&
        message.uploadedAttachmentsInfo.length
      ) {
        message.uploadedAttachmentsInfo.forEach(attachment => {
          this.getImageUrl(attachment);
        });
      }
    });
  }

  moveToTrash(mailId) {
    var message = this.mailLoopModel.messages.filter(m => m.id === mailId)[0];
    if (this.mailType === 'trash') {
      this.inMailService
        .deleteMail([mailId], 'trash', 'delete')
        .subscribe(res => {
          this.toastrService.success('Email deleted permanently.', 'SUCCESS', {
            timeOut: environment.messageTimeout,
          });
        });
    } else {
      let action = 'trash';
      if (message.storage === 'draft') {
        action = 'delete';
      }
      this.inMailService
        .deleteMail([mailId], message.storage, action)
        .subscribe(res => {
          this.toastrService.success('Email deleted successfully', 'SUCCESS', {
            timeOut: environment.messageTimeout,
          });
        });
    }
    this.router.navigate([`main/mailbox/${this.mailType}`]);
  }

  onBackClick() {
    this.router.navigate([`main/mailbox/${this.mailType}`]);
  }

  deleteMail(mailId) {
    this.dialogService.open(DeleteMailComponent, {
      context: {
        mailId: mailId,
        callback: this.moveToTrash.bind(this),
      },
    });
  }
  onPrintClick() {
    window.open(
      `printMail/${this.mailViewId}/${this.store.getUser().tenantId}/${
        this.store.getUser().id
      }`,
      '_blank',
    );
  }
}
