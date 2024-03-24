import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HcpManagementComponent} from './hcp-management.component';
import {HcpManagementRoutingModule} from './hcp-management-routing.module';
import {VmslGridModule} from '@vmsl/shared/vmsl-grid/vmsl-grid.module';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {SharedModule} from '@vmsl/shared/shared.module';
import {NbDialogModule} from '@nebular/theme';
import {NgxPermissionsModule} from 'ngx-permissions';
import {NgxPaginationModule} from 'ngx-pagination';
import {HcpManagementService} from './shared/facades/hcp-management.service';
import {HcpRequestListAdapter} from './shared/adapters/hcprequest-list-adapter.service';
import {HcpActionIconComponent} from './hcp-action-icon/hcp-action-icon.component';

@NgModule({
  declarations: [HcpManagementComponent, HcpActionIconComponent],
  imports: [
    CommonModule,
    HcpManagementRoutingModule,
    VmslGridModule,
    ThemeModule.forRoot(),
    SharedModule,
    NbDialogModule.forChild(),
    NgxPermissionsModule.forChild(),
    NgxPaginationModule,
  ],
  providers: [HcpManagementService, HcpRequestListAdapter],
})
export class HcpManagementModule {}
