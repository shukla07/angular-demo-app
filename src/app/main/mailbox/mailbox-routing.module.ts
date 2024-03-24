import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {MailboxComponent} from './mailbox.component';
import {MailboxInboxComponent} from './inbox/inbox.component';
import {MailboxSentComponent} from './sent/sent.component';
import {MailboxImportantComponent} from './important/important.component';
import {MailboxDraftComponent} from './draft/draft.component';
import {MailboxTrashComponent} from './trash/trash.component';
import {MailboxComposeEmailComponent} from './compose-email/compose-email.component';
import {MailboxDraftedEmailComponent} from './drafted-email/drafted-email.component';
import {MailboxMailViewLoopComponent} from './mail-view-loop/mail-view-loop.component';

const routes: Routes = [
  {
    path: '',
    component: MailboxComponent,

    children: [
      {
        path: '',
        redirectTo: 'inbox',
        pathMatch: 'full',
      },
      {
        path: 'inbox',
        component: MailboxInboxComponent,
      },
      {
        path: 'send',
        component: MailboxSentComponent,
      },
      {
        path: 'important',
        component: MailboxImportantComponent,
      },
      {
        path: 'drafts',
        component: MailboxDraftComponent,
      },
      {
        path: 'trash',
        component: MailboxTrashComponent,
      },
      {
        path: 'mail-view-loop/:id',
        component: MailboxMailViewLoopComponent,
      },
      {
        path: 'compose-email',
        component: MailboxComposeEmailComponent,
      },
      {
        path: 'drafted-email/:id',
        component: MailboxDraftedEmailComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MailboxRoutingModule {}
