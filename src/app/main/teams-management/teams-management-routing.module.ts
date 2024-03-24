import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {TeamsManagementComponent} from './teams-management.component';
import {CreateTeamComponent} from './create-team/create-team.component';
import {TeamProfileComponent} from './team-profile/team-profile.component';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {NgxPermissionsGuard} from 'ngx-permissions';
import {environment} from '@vmsl/env/environment';

const routes: Routes = [
  {
    path: '',
    component: TeamsManagementComponent,
  },
  {
    path: 'add',
    component: CreateTeamComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [Permission.CreateTenantTeam],
        redirectTo: environment.homePath,
      },
    },
  },
  {
    path: 'edit/:id',
    component: CreateTeamComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [Permission.UpdateTenantTeam],
        redirectTo: environment.homePath,
      },
    },
  },
  {
    path: 'profile/:id',
    component: TeamProfileComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [Permission.ViewTenantTeams],
        redirectTo: environment.homePath,
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamsManagementRoutingModule {}
