import {Component} from '@angular/core';
import {RouteComponentBase} from '../core/route-component-base';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {UserSessionStoreService} from '../core/store/user-session-store.service';
import {EmailLoopModel} from '../main/mailbox/shared/models/email-loop.model';
import {PrintService} from './print-mail.service';
import {UserInfo} from '../core/auth/models/user.model';

@Component({
  selector: 'vmsl-print-mail',
  templateUrl: './print-mail.component.html',
  styleUrls: ['./print-mail.component.scss'],
})
export class PrintMailComponent extends RouteComponentBase {
  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly printService: PrintService,
    private readonly store: UserSessionStoreService,
  ) {
    super(route, location);
  }
  contacts: UserInfo[];

  mailViewId;
  currentUserName;
  tenantId;
  mailLoopModel: EmailLoopModel = new EmailLoopModel();
  ngOnInit(): void {
    let userId = '';
    this.route.paramMap.subscribe(params => {
      this.mailViewId = params.get('id');
      this.tenantId = params.get('tenantId');
      userId = params.get('userId');
    });
    const currentUser = this.store.getUser();
    this.currentUserName = `${currentUser.firstName} ${currentUser.lastName}`;
    this.printService
      .getMyContacts(this.tenantId, userId)
      .subscribe(contactsList => {
        this.contacts = contactsList;
        var st = this.store;
        this.contacts.push(st.getUser());
        this.getCurrentMail();
      });
  }

  getCurrentMail() {
    this.printService
      .getMailById(this.mailViewId, this.tenantId)
      .subscribe(res => {
        this.mailLoopModel = res;

        this.mailLoopModel.messages.forEach(mail => {
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
        setTimeout(() => {
          window.print();
        });
      });
  }
}
