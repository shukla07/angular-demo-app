import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AuditLogsComponent} from './audit-logs.component';

const routes: Routes = [
  {
    path: '',
    component: AuditLogsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuditLogsRoutingModule {}
