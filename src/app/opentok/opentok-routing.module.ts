import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {OpentokComponent} from './opentokApp.component';

const routes: Routes = [
  {
    path: '',
    component: OpentokComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OpentokRoutingModule {}
