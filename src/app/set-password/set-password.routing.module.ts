import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {NbAuthComponent} from '@nebular/auth';
import {OtpComponent} from './otp/otp.component';
import {SetPasswordComponent} from './password/set-password.component';

const routes: Routes = [
  {
    path: 'otp',
    component: NbAuthComponent,
    children: [
      {
        path: '',
        component: OtpComponent,
      },
    ],
  },
  {
    path: 'password',
    component: NbAuthComponent,
    children: [
      {
        path: '',
        component: SetPasswordComponent,
      },
    ],
  },
  {
    path: '',
    redirectTo: 'otp',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SetPasswordRoutingModule {}
