import {Component, ViewEncapsulation} from '@angular/core';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';

@Component({
  selector: 'vmsl-mailbox',
  templateUrl: './mailbox.component.html',
  styleUrls: ['./mailbox.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MailboxComponent extends RouteComponentBase {
  mailboxLists = [
    {
      name: 'Inbox',
      count: 5,
      link: '/main/mailbox/inbox',
      icon: 'inbox-outline',
    },
    {
      name: 'Sent Mail',
      count: 4,
      link: '/main/mailbox/send',
      icon: 'email-outline',
    },
    {
      name: 'Important',
      count: 3,
      link: '/main/mailbox/important',
      icon: 'star-outline',
    },
    {
      name: 'Drafts',
      count: 2,
      link: '/main/mailbox/drafts',
      icon: 'file-text-outline',
    },
    {
      name: 'Trash',
      count: 3,
      link: '/main/mailbox/trash',
      icon: 'trash-2-outline',
    },
  ];
  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
  ) {
    super(route, location);
  }
}
