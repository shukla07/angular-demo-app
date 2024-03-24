import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {UserComponent} from './users/user.component';
import {AddUserComponent} from './add-user/add-user.component';
import {NgxPermissionsGuard} from 'ngx-permissions';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {environment} from '@vmsl/env/environment';

const routes: Routes = [
  {
    path: '',
    component: UserComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [Permission.ViewTenantUserListing],
        redirectTo: environment.homePath,
      },
    },
  },
  {
    path: 'edit/:id',
    component: AddUserComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [Permission.UpdateTenantUser],
        redirectTo: environment.homePath,
      },
    },
  },
  {
    path: 'edit',
    component: AddUserComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [Permission.UpdateOwnUser],
        redirectTo: environment.homePath,
      },
    },
  },
  {
    path: 'add',
    component: AddUserComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [Permission.CreateTenantUser],
        redirectTo: environment.homePath,
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
