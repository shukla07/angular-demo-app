import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ModReportsComponent} from './mod-reports.component';

const routes: Routes = [
  {
    path: '',
    component: ModReportsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModReportsRoutingModule {}
