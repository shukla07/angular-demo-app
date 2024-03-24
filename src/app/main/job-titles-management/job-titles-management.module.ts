import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {JobTitlesManagementRoutingModule} from './job-titles-management-routing.module';
import {JobTitlesManagementComponent} from './job-titles-management.component';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {NgxPaginationModule} from 'ngx-pagination';
import {NgxPermissionsModule} from 'ngx-permissions';
import {NgSelectModule} from '@ng-select/ng-select';
import {JobTitlesAdapter} from '../../shared/adapters/job-titles-adapter.service';
import {JobTitlesManagementActionIconComponent} from './job-titles-management-action-icon/job-titles-management-action-icon.component';
import {CreateJobTitleComponent} from './create-job-title/create-job-title.component';
import {JobTitlesManagementService} from '@vmsl/shared/facades/job-titles-management.service';
import {JobTitleHeaderComponent} from './job-title-header/job-title-header.component';
import {SharedModule} from '@vmsl/shared/shared.module';

@NgModule({
  declarations: [
    JobTitlesManagementComponent,
    JobTitlesManagementActionIconComponent,
    CreateJobTitleComponent,
    JobTitleHeaderComponent,
  ],
  imports: [
    CommonModule,
    JobTitlesManagementRoutingModule,
    ThemeModule.forRoot(),
    NgxPaginationModule,
    NgxPermissionsModule.forChild(),
    NgSelectModule,
    SharedModule,
  ],
  providers: [JobTitlesManagementService, JobTitlesAdapter],
})
export class JobTitlesManagementModule {}
