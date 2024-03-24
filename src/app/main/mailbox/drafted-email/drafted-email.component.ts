import {Component} from '@angular/core';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {NbDialogService} from '@nebular/theme';
import {InMailService} from '../shared/facade/in-mail.service';
import {EmailModel} from '../shared/models/email.model';
import {DeleteMailComponent} from '../delete-mail/delete-mail.component';

@Component({
  selector: 'vmsl-mailbox-drafted-email',
  templateUrl: './drafted-email.component.html',
  styleUrls: ['./drafted-email.component.scss'],
})
export class MailboxDraftedEmailComponent extends RouteComponentBase {
  mailId;
  draftedMail: EmailModel;
  mailType = 'draft';
  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly dialogService: NbDialogService,
    private readonly inMailService: InMailService,
    private readonly router: Router,
  ) {
    super(route, location);
  }
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.mailId = params.get('id');
    });
    this.getCurrentMail();
  }

  getCurrentMail() {
    this.inMailService.getDraftedMailById(this.mailId).subscribe(res => {
      this.draftedMail = res.messages[0];
    });
  }

  moveToTrash(mailId) {
    this.inMailService
      .deleteMail([mailId], this.mailType, 'trash')
      .subscribe(res => {
        this.router.navigate([`main/mailbox/${this.mailType}`]);
      });
  }

  deleteMail() {
    this.dialogService.open(DeleteMailComponent, {
      context: {
        callback: this.moveToTrash.bind(this),
      },
    });
  }
}
