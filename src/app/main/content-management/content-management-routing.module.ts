import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {environment} from '@vmsl/env/environment';
import {NgxPermissionsGuard} from 'ngx-permissions';
import {ContentManagementComponent} from './content-management.component';
import {CreateContentComponent} from './create-content/create-content.component';
import {ViewContentComponent} from './view-content/view-content.component';

const routes: Routes = [
  {
    path: '',
    component: ContentManagementComponent,
  },
  {
    path: 'add',
    component: CreateContentComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [Permission.CreateTenantContents],
        redirectTo: environment.homePath,
      },
    },
  },
  {
    path: 'edit/:id',
    component: CreateContentComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [Permission.UpdateTenantContents],
        redirectTo: environment.homePath,
      },
    },
  },
  {
    path: 'view/:id',
    component: ViewContentComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [Permission.ViewTenantContents],
        redirectTo: environment.homePath,
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContentManagementRoutingModule {}
