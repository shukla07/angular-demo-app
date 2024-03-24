import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {MaLinkComponent} from './ma-link/ma-link.component';

const routes: Routes = [
  {
    path: '',
    component: MaLinkComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MARoutingModule {}
