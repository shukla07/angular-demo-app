import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HcpManagementComponent} from './hcp-management.component';

const routes: Routes = [
  {
    path: '',
    component: HcpManagementComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HcpManagementRoutingModule {}
