import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {TeamsComponent} from './teams.component';
import {NgxPermissionsGuard} from 'ngx-permissions';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {environment} from '@vmsl/env/environment';

const routes: Routes = [
  {
    path: '',
    component: TeamsComponent,
  },
  {
    path: 'teams-calendar/:id/:name',
    loadChildren: () =>
      import('./teams-calendar/teams-calendar.module').then(
        m => m.TeamsCalendarModule,
      ),
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [Permission.ViewTeamEvent, Permission.ViewTeamEventHCP],
        redirectTo: environment.homePath,
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamsRoutingModule {}
