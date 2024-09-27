import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { TeamsCalendarComponent } from './teams-calendar.component';

const routes: Routes = [
  {
    path: '',
    component: TeamsCalendarComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamsCalendarRoutingModule {}
