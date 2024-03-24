import {Component, Input, ViewChild, ViewEncapsulation} from '@angular/core';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {NbDialogService, NbDialogModule, NbDialogRef} from '@nebular/theme';
import {UserFacadeService} from '@vmsl/shared/facades/user-facade.service';
import {UserInfo} from '@vmsl/core/auth/models/user.model';
import {InMailService} from '../shared/facade/in-mail.service';
import {ToastrService} from 'ngx-toastr';
import {environment} from '@vmsl/env/environment';
import {forkJoin} from 'rxjs';
import {EmailModel} from '../shared/models/email.model';
import {AttachmentModel} from '../shared/models/attachment.model';
import {InMailConfig} from '../shared/in-mail.config';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {NgSelectComponent} from '@ng-select/ng-select';
import {NameId} from '@vmsl/core/models';
import {ContentPopupComponent} from '@vmsl/shared/components/content-popup/content-popup.component';
import {CommonService} from '@vmsl/shared/facades/common.service';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {
  limitHundred,
  limitThousand,
  limitTwentyFive,
} from '@vmsl/shared/model/items-per-page-list';

@Component({
  selector: 'vmsl-mailbox-compose-email',
  templateUrl: './compose-email.component.html',
  styleUrls: ['./compose-email.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MailboxComposeEmailComponent extends RouteComponentBase {
  @ViewChild('toField') toField: NgSelectComponent;
  @ViewChild('ccField') ccField: NgSelectComponent;
  @ViewChild('bccField') bccField: NgSelectComponent;

  @Input('composeEmail') composeEmail = new EmailModel();
  @Input('mailType') mailType = 'inbox';
  maxFileSize;
  attachmentsToRemove: AttachmentModel[] = [];
  isAttachmentUploading = false;
  contentAttachment = [];
  dialogRef: NbDialogRef<NbDialogModule>;
  contacts: UserInfo[];
  @Input() onCustomSend: () => void;
  @Input() onCustomDiscard: () => void;
  inMailConfig = InMailConfig;
  editorConfig = this.inMailConfig.editorConfig;
  mailTitle = 'Compose Mail';
  disableSubject = false;
  emailFields = {
    to: [],
    cc: [],
    bcc: [],
  };
  permissionKey = Permission;

  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly store: UserSessionStoreService,
    private readonly dialogService: NbDialogService,
    private readonly userFacadeService: UserFacadeService,
    private readonly inMailService: InMailService,
    private readonly toastrService: ToastrService,
    private readonly router: Router,
    private readonly commonService: CommonService,
  ) {
    super(route, location);
  }

  ngOnInit() {
    const replyToMail = this.getQueryParam('mailType');
    if (this.getRouteParam('id') && replyToMail) {
      this.composeEmail.threadId = this.getRouteParam('id');
    }

    if (this.composeEmail || replyToMail) {
      this.emailFields.to = this.composeEmail.to
        ? this.composeEmail.to.map(user => user.id)
        : [];
      this.emailFields.cc = this.composeEmail.cc
        ? this.composeEmail.cc.map(user => user.id)
        : [];
      this.emailFields.bcc = this.composeEmail.bcc
        ? this.composeEmail.bcc.map(user => user.id)
        : [];
    }
    const size = 30000000;
    this.maxFileSize = size;

    if (this.mailType === 'draft') {
      this.mailTitle = 'Drafted Mail';
    }
    this.getContacts();
    this.disableSubject =
      !window.location.href.includes('compose-email') &&
      !window.location.href.includes('drafted-email');

    this._subscriptions.push(
      this.commonService.contentInMailObv.subscribe(resp => {
        if (resp) {
          this.contentAttachment = resp;
          this.dialogRef.close();
          this.commonService.setContentInMail(null);
        }
      }),
    );
  }

  showCcInput = false;
  showBccInput = false;
  @Input('sendText') sendText = 'Send';

  onDraftClick() {
    if (this.attachmentsToRemove?.length) {
      this.removeDeletedUploadedAttachments(this.saveAsDraft.bind(this));
    } else {
      this.saveAsDraft();
    }
  }

  onSendClick() {
    if (this.attachmentsToRemove?.length) {
      this.removeDeletedUploadedAttachments(
        this.uploadAttachmentsAndSendEmail.bind(this),
      );
    } else {
      this.uploadAttachmentsAndSendEmail();
    }
  }

  onSelect(event) {
    if (event.addedFiles?.length) {
      this.isAttachmentUploading = true;
      this.onAttachmentSelected(event);
      this.composeEmail.files.push(...event.addedFiles);
    }
    if (event.rejectedFiles?.length) {
      if (event.rejectedFiles[0].reason === 'size') {
        this.toastrService.error(
          'File size exceeding maximum limit of 30 MB',
          'ERROR ',
          {
            timeOut: environment.messageTimeout,
          },
        );
      } else if (event.rejectedFiles[0].reason === 'type') {
        this.toastrService.error(
          'Please select a valid file type.',
          'Invalid file type.',
          {
            timeOut: environment.messageTimeout,
          },
        );
      } else {
        //empty else block
      }
    }
  }

  onRemove(event) {
    this.isAttachmentUploading = false;
    this.composeEmail.files.splice(this.composeEmail.files.indexOf(event), 1);
  }

  onRemoveContent(content) {
    this.contentAttachment.splice(this.contentAttachment.indexOf(content), 1);
  }

  openLinkContent() {
    this.dialogRef = this.dialogService.open(ContentPopupComponent, {
      closeOnBackdropClick: false,
      context: {inMail: true},
    });
  }

  validateInputs(): boolean {
    if (
      !this.emailFields?.to?.length &&
      !this.emailFields?.bcc?.length &&
      !this.emailFields?.cc?.length
    ) {
      this.toastrService.error('Please select a recipient', 'ERROR ', {
        timeOut: environment.messageTimeout,
      });
      return false;
    }
    if (!this.composeEmail?.htmlContent) {
      this.toastrService.error(
        'Please enter  a message in the email',
        'ERROR ',
        {
          timeOut: environment.messageTimeout,
        },
      );
      return false;
    }
    if (!this.composeEmail?.subject) {
      this.toastrService.error('Please add subject of the email.', 'ERROR ', {
        timeOut: environment.messageTimeout,
      });
      return false;
    }

    return true;
  }

  validateDraftInputs() {
    if (!this.emailFields.to || !this.emailFields.to.length) {
      this.toastrService.error('Please select a recipient.', 'ERROR ', {
        timeOut: environment.messageTimeout,
      });
      return false;
    }
    return true;
  }

  uploadAttachmentsAndSendEmail() {
    if (!this.validateInputs()) {
      return;
    }
    let callback;
    if (typeof this.onCustomSend === 'function') {
      callback = this.onCustomSend;
    } else {
      callback = this.sendEmail.bind(this, this.composeEmail);
    }
    if (this.sendText === 'Forward') {
      this.setEmailExtMetadata();
    }
    if (this.composeEmail.files?.length) {
      this.uploadAttachments(callback);
    } else {
      if (
        (this.mailType !== 'draft' && this.mailType !== 'Forward') ||
        !this.composeEmail.uploadedAttachmentsInfo?.length
      ) {
        this.composeEmail.uploadedAttachmentsInfo = [];
      }
      callback(this.composeEmail);
    }
  }
  attachContentFiles() {
    if (!this.composeEmail.uploadedAttachmentsInfo) {
      this.composeEmail.uploadedAttachmentsInfo = [];
    }
    if (this.contentAttachment?.length) {
      this.contentAttachment.forEach(res => {
        const model = new AttachmentModel();
        model.id = res.id;
        model.name = res.title;
        model.path = res.fileKey;
        model.thumbnail = 'abc';
        model.mime = res.fileType;
        this.composeEmail.uploadedAttachmentsInfo.push(model);
      });
    }
  }
  sendEmail() {
    this.composeEmail.status = 'send';
    this.setEmailExtMetadata();
    this.attachContentFiles();
    if (this.mailType === 'draft' || this.composeEmail.storage === 'draft') {
      this.inMailService.sendSavedDraft(this.composeEmail).subscribe(resp => {
        this.redirectToInbox();
      });
    } else {
      this.inMailService.sendOrSaveMail(this.composeEmail).subscribe(res => {
        this.redirectToInbox();
      });
    }
  }

  redirectToInbox() {
    this.toastrService.success('Email sent successfully', 'SUCCESS', {
      timeOut: environment.messageTimeout,
    });
    this.router.navigate([`/main/mailbox/inbox`]);
  }

  setEmailExtMetadata() {
    this.composeEmail.from = new NameId({
      name: `${this.store.getUser().firstName} ${
        this.store.getUser().lastName
      }`,
      id: this.store.getUser().id,
    });
    this.composeEmail.to = this.extractDataFromDropdown(this.toField);
    this.composeEmail.cc = this.extractDataFromDropdown(this.ccField);
    this.composeEmail.bcc = this.extractDataFromDropdown(this.bccField);
  }

  extractDataFromDropdown(dropdown: NgSelectComponent) {
    let nameIdArr = [];
    if (dropdown && dropdown.selectedValues.length) {
      nameIdArr = dropdown.selectedValues.map(user => {
        return {
          name: user['fullName'],
          id: user['id'],
        };
      });
    }
    return nameIdArr;
  }

  saveAsDraft() {
    this.attachContentFiles();
    if (this.composeEmail.files?.length) {
      this.uploadAttachments(this.saveAsDraftInternal.bind(this));
    } else {
      this.saveAsDraftInternal();
    }
  }

  removeDeletedUploadedAttachments(callback) {
    if (this.attachmentsToRemove?.length) {
      this.attachmentsToRemove.forEach(attachment => {
        attachment.messageId = this.composeEmail.messageId;
        this.inMailService.removeAttachment(attachment).subscribe();
      });
      if (typeof callback === 'function') {
        callback();
      }
    }
  }

  private saveAsDraftInternal() {
    if (!this.validateDraftInputs()) {
      return;
    }
    this.composeEmail.status = 'draft';
    this.composeEmail.to = this.extractDataFromDropdown(this.toField);
    this.composeEmail.cc = this.extractDataFromDropdown(this.ccField);
    this.composeEmail.bcc = this.extractDataFromDropdown(this.bccField);
    if (
      (this.getQueryParam('mailType') === 'inbox' ||
        this.getQueryParam('mailType') === 'send' ||
        this.getQueryParam('mailType') === 'important') &&
      this.composeEmail.storage !== 'draft'
    ) {
      this.inMailService.replyToMessage(this.composeEmail).subscribe(res => {
        this.toastrService.success('Email saved to drafts.', 'SUCCESS', {
          timeOut: environment.messageTimeout,
        });
        this.router.navigate([`/main/mailbox/inbox`]);
      });
    } else if (
      this.mailType === 'draft' ||
      this.composeEmail.storage === 'draft'
    ) {
      //When user updates the saved draft.
      this.inMailService.sendSavedDraft(this.composeEmail).subscribe(res => {
        this.toastrService.success('Draft updated succesfully.', 'SUCCESS', {
          timeOut: environment.messageTimeout,
        });
        this.router.navigate([`/main/mailbox/drafts`]);
      });
    } else {
      if (!this.composeEmail.from) {
        this.composeEmail.from = new NameId({
          name: `${this.store.getUser().firstName} ${
            this.store.getUser().lastName
          }`,
          id: this.store.getUser().id,
        });
      }
      this.inMailService.sendOrSaveMail(this.composeEmail).subscribe(res => {
        this.toastrService.success('Email saved to drafts', 'SUCCESS', {
          timeOut: environment.messageTimeout,
        });
        this.router.navigate([`/main/mailbox/inbox`]);
      });
    }
  }

  onAttachmentSelected(attachment) {
    const latestAttachment =
      attachment.addedFiles[attachment.addedFiles.length - 1];
    latestAttachment['uploadValue'] = 0;
    setInterval(() => {
      if (latestAttachment['uploadValue'] < limitHundred) {
        latestAttachment['uploadValue'] = Math.min(
          Math.max(latestAttachment['uploadValue'] + limitTwentyFive, 0),
          limitHundred,
        );
      } else {
        this.isAttachmentUploading = false;
      }
    }, limitThousand);
  }

  uploadAttachments(callback = null) {
    const uploadFilesFncList = [];
    this.isAttachmentUploading = true;
    this.composeEmail.files.forEach(file => {
      uploadFilesFncList.push(this.inMailService.uploadAttachment(file));
      this.inMailService.uploadAttachment(file).subscribe();
    });
    forkJoin(uploadFilesFncList).subscribe(responseArr => {
      if (responseArr?.length) {
        responseArr.forEach(res => {
          const model = new AttachmentModel();
          model.mime = res['mime'];
          model.path = res['Key'];
          model.thumbnail = 'abc';
          model.name = res['name'];
          model.id = res['id'];
          model.messageId = res['messageId'];
          this.composeEmail.uploadedAttachmentsInfo.push(model);
        });
      }
      if (typeof callback === 'function') {
        callback(this.composeEmail);
      }
      this.isAttachmentUploading = false;
    });
  }

  discardMail() {
    if (this.mailType === 'draft') {
      this.goBack();
    } else {
      this.composeEmail = new EmailModel();
      if (typeof this.onCustomDiscard === 'function') {
        this.onCustomDiscard();
      } else {
        this.router.navigate(['main/mailbox/inbox']);
      }
    }
  }

  getContacts() {
    this.userFacadeService.getMyContacts().subscribe(res => {
      this.contacts = res;

      const arr = this.composeEmail.to;
      arr.forEach(user => {
        /*NOSONAR*/ if (!(user.id in this.contacts)) {
          const newUser = new UserInfo();
          for (const prop in user) {
            newUser[prop] = user[prop];
          }
          newUser['firstName'] = user.name;
          this.contacts.push(newUser);
        }
      });
      const currentUser = new UserInfo();
      const storedUser = this.store.getUser();
      for (const prop in storedUser) {
        currentUser[prop] = storedUser[prop];
      }
      this.contacts.push(currentUser);
      this.contacts.sort((a, b) =>
        a.nameWithRole.localeCompare(b.nameWithRole),
      );
    });

    if (this.getQueryParam('to')) {
      this.emailFields.to.push(this.getQueryParam('to'));
    }
  }

  removeAttachment(attachment) {
    this.attachmentsToRemove.push(attachment);
    const index = this.composeEmail.uploadedAttachmentsInfo.findIndex(
      a => a.id === attachment.id,
    );
    this.composeEmail.uploadedAttachmentsInfo.splice(index, 1);
  }
}
