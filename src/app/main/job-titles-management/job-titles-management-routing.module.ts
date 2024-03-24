import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {environment} from '@vmsl/env/environment';
import {NgxPermissionsGuard} from 'ngx-permissions';
import {JobTitlesManagementComponent} from './job-titles-management.component';
import {CreateJobTitleComponent} from './create-job-title/create-job-title.component';

const routes: Routes = [
  {
    path: '',
    component: JobTitlesManagementComponent,
  },
  {
    path: 'add',
    component: CreateJobTitleComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [Permission.CreateTenantJobTitles],
        redirectTo: environment.homePath,
      },
    },
  },
  {
    path: 'edit/:id',
    component: CreateJobTitleComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [Permission.UpdateTenantJobTitles],
        redirectTo: environment.homePath,
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JobTitlesManagementRoutingModule {}
