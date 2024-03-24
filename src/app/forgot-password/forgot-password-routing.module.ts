import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {NbAuthComponent} from '@nebular/auth';
import {EmailPasswordComponent} from './email/email.component';
import {SetPasswordComponent} from './password/set-password.component';

const routes: Routes = [
  {
    path: '',
    component: NbAuthComponent,
    children: [
      {
        path: '',
        component: EmailPasswordComponent,
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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ForgotPasswordRoutingModule {}
