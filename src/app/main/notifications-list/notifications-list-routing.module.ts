import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {NotificationsListComponent} from './notifications-list.component';

const routes: Routes = [
  {
    path: '',
    component: NotificationsListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationsListRoutingModule {}
