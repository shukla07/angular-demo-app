import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CalendarComponent } from './calendar.component';

const routes: Routes = [
  {
    path: '',
    component: CalendarComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalendarRoutingModule {}
