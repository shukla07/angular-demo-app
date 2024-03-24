import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {HcpLoginComponent} from './hcp-login/hcp-login.component';
import {RegistrationComponent} from './registration/registration.component';
import {NbAuthComponent} from '@nebular/auth';

const routes: Routes = [
  {
    path: '',
    component: NbAuthComponent,
  },
  {
    path: 'login',
    component: NbAuthComponent,
    children: [
      {
        path: '',
        component: HcpLoginComponent,
      },
    ],
  },
  {
    path: 'register',
    component: NbAuthComponent,
    children: [
      {
        path: '',
        component: RegistrationComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HcpRegistrationRoutingModule {}
