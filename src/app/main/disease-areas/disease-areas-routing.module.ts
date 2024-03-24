import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {environment} from '@vmsl/env/environment';
import {NgxPermissionsGuard} from 'ngx-permissions';
import {CreateDiseaseAreaComponent} from './create-disease-area/create-disease-area.component';
import {DiseaseAreasComponent} from './disease-areas.component';

const routes: Routes = [
  {
    path: '',
    component: DiseaseAreasComponent,
  },
  {
    path: 'add',
    component: CreateDiseaseAreaComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [Permission.CreateTenantDiseaseArea],
        redirectTo: environment.homePath,
      },
    },
  },
  {
    path: 'edit/:id',
    component: CreateDiseaseAreaComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [Permission.UpdateTenantDiseaseArea],
        redirectTo: environment.homePath,
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DiseaseAreasRoutingModule {}
