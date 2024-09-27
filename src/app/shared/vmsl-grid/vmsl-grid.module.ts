import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {VmslGridComponent} from './vmsl-grid-wrapper/vmsl-grid-wrapper.component';
import {AgGridModule} from 'ag-grid-angular';
import {ActionIconLinkComponent} from './components/action-icon-link/action-icon-link.component';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {NgxPermissionsModule} from 'ngx-permissions';
import { JobTitlesManagementActionIconComponent } from '../../main/job-titles-management/job-titles-management-action-icon/job-titles-management-action-icon.component';

@NgModule({
  declarations: [VmslGridComponent, ActionIconLinkComponent],
  imports: [
    CommonModule,
    AgGridModule.withComponents([ActionIconLinkComponent,JobTitlesManagementActionIconComponent]),
    ThemeModule.forRoot(),
    NgxPermissionsModule.forChild(),
  ],
  exports: [VmslGridComponent, ActionIconLinkComponent],
})
export class VmslGridModule {}
