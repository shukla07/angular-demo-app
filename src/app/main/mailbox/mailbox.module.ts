import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {MailboxComponent} from './mailbox.component';
import {MailboxRoutingModule} from './mailbox-routing.module';
import {MailboxInboxComponent} from './inbox/inbox.component';
import {MailboxSentComponent} from './sent/sent.component';
import {MailboxImportantComponent} from './important/important.component';
import {MailboxDraftComponent} from './draft/draft.component';
import {MailboxTrashComponent} from './trash/trash.component';
import {NgSelectModule} from '@ng-select/ng-select';
import {MailboxComposeEmailComponent} from './compose-email/compose-email.component';
import {AngularEditorModule} from '@kolkov/angular-editor';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {NgxPaginationModule} from 'ngx-pagination';
import {MailboxDraftedEmailComponent} from './drafted-email/drafted-email.component';
import {MailboxMailViewLoopComponent} from './mail-view-loop/mail-view-loop.component';
import {DeleteMailComponent} from './delete-mail/delete-mail.component';
import {GetDraftedMailByIdAdapter} from './shared/adapters/get-drafted-mail-by-id-adapter.service';
import {GetImportantMailsAdapter} from './shared/adapters/get-important-mails-adapter.service';
import {GetMailByIdAdapter} from './shared/adapters/get-mail-by-id-adapter.service';
import {GetSentMailsAdapter} from './shared/adapters/get-sent-mails-adapter.service';
import {GetTrashMailByIdAdapter} from './shared/adapters/get-trash-mail-by-id-adapter.service';
import {GetTrashMailsAdapter} from './shared/adapters/get-trash-mails-adapter.service';
import {ReplyToMessageAdapter} from './shared/adapters/reply-to-message-adapter.service';
import {InMailService} from './shared/facade/in-mail.service';
import {ComposeEmailAdapter} from './shared/adapters/compose-email-adapter.service';
import {ForwardMailAdapter} from './shared/adapters/forward-mail-adapter.service';
import {GetDraftsMailsAdapter} from './shared/adapters/get-draft-mails-adapter.service';
import {NgxPermissionsModule} from 'ngx-permissions';

@NgModule({
  declarations: [
    MailboxComponent,
    MailboxInboxComponent,
    MailboxSentComponent,
    MailboxImportantComponent,
    MailboxDraftComponent,
    MailboxTrashComponent,
    MailboxComposeEmailComponent,
    MailboxDraftedEmailComponent,
    MailboxMailViewLoopComponent,
    DeleteMailComponent,
  ],
  imports: [
    CommonModule,
    MailboxRoutingModule,
    AngularEditorModule,
    NgxDropzoneModule,
    ThemeModule.forRoot(),
    NgxPaginationModule,
    NgxPermissionsModule,
    NgSelectModule,
  ],
  providers: [
    InMailService,
    GetMailByIdAdapter,
    ReplyToMessageAdapter,
    GetSentMailsAdapter,
    GetDraftedMailByIdAdapter,
    GetTrashMailsAdapter,
    GetTrashMailByIdAdapter,
    GetImportantMailsAdapter,
    ComposeEmailAdapter,
    ForwardMailAdapter,
    GetDraftsMailsAdapter,
  ],
})
export class MailboxModule {}
