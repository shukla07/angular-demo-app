import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {environment} from '@vmsl/env/environment';
import {NgxPermissionsGuard} from 'ngx-permissions';
import {CreateTerritoryComponent} from './create-territory/create-territory.component';
import {TerritoriesManagementComponent} from './territories-management.component';

const routes: Routes = [
  {
    path: '',
    component: TerritoriesManagementComponent,
  },
  {
    path: 'add',
    component: CreateTerritoryComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [Permission.CreateTenantTerritory],
        redirectTo: environment.homePath,
      },
    },
  },
  {
    path: 'edit/:id',
    component: CreateTerritoryComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [Permission.UpdateTenantTerritory],
        redirectTo: environment.homePath,
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TerritoriesManagementRoutingModule {}
