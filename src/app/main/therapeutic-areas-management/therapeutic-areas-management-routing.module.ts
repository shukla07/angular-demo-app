import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {environment} from '@vmsl/env/environment';
import {NgxPermissionsGuard} from 'ngx-permissions';
import {CreateTherapeuticAreaComponent} from './create-therapeutic-area/create-therapeutic-area.component';
import {TherapeuticAreasManagementComponent} from './therapeutic-areas-management.component';

const routes: Routes = [
  {
    path: '',
    component: TherapeuticAreasManagementComponent,
  },
  {
    path: 'add',
    component: CreateTherapeuticAreaComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [Permission.CreateTenanttherapeuticArea],
        redirectTo: environment.homePath,
      },
    },
  },
  {
    path: 'edit/:id',
    component: CreateTherapeuticAreaComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [Permission.UpdateTenanttherapeuticArea],
        redirectTo: environment.homePath,
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TherapeuticAreasManagementRoutingModule {}
