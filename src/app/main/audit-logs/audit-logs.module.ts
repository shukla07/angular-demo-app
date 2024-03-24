import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AuditLogsRoutingModule} from './audit-logs-routing.module';
import {AuditLogsComponent} from './audit-logs.component';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {NgxPermissionsModule} from 'ngx-permissions';
import {AuditLogsService} from './shared/audit-logs.service';
import {FlatpickrModule} from 'angularx-flatpickr';
import {SharedModule} from '@vmsl/shared/shared.module';
import {NgxPaginationModule} from 'ngx-pagination';
import {AuditLogsListAdapter} from './shared/adapters/auditlogs-list-adapter.service';
import {NgxObjectDiffModule} from 'ngx-object-diff';
import {AuditActionIconsComponent} from './auditlogs-action-icons/audit-action-icons.component';
import {GetLinkedUserAdapter} from '../../shared/adapters/get-linked-users-adapter.service';

@NgModule({
  declarations: [AuditLogsComponent, AuditActionIconsComponent],
  imports: [
    CommonModule,
    SharedModule,
    AuditLogsRoutingModule,
    ThemeModule.forRoot(),
    NgxPermissionsModule.forChild(),
    FlatpickrModule.forRoot(),
    NgxPaginationModule,
    NgxObjectDiffModule,
  ],
  providers: [AuditLogsService, AuditLogsListAdapter, GetLinkedUserAdapter],
})
export class AuditLogsModule {}
