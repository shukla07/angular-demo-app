import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {AddressBookComponent} from './address-book.component';

const routes: Routes = [
  {
    path: '',
    component: AddressBookComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddressBookRoutingModule {}
