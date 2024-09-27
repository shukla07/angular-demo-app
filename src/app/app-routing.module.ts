import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AuthGuard} from './core/auth/auth.guard';
import {LoggedInGuard} from './core/auth/logged-in.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginModule),
    canActivate: [LoggedInGuard],
  },
  {
    path: 'forgot-password',
    loadChildren: () =>
      import('./forgot-password/forgot-password.module').then(
        m => m.ForgotPasswordModule,
      ),
  },
  {
    path: 'set-password',
    loadChildren: () =>
      import('./set-password/set-password.module').then(
        m => m.SetPasswordModule,
      ),
  },
  {
    path: 'main',
    loadChildren: () => import('./main/main.module').then(m => m.MainModule),
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
  },
  {
    path: 'hcp',
    loadChildren: () =>
      import('./hcp-registration/hcp-registration.module').then(
        m => m.HcpRegistrationModule,
      ),
    canActivate: [LoggedInGuard],
  },
  {
    path: 'printMail/:id/:tenantId/:userId',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./print-mail/print-mail.module').then(m => m.PrintMailModule),
  },
  {
    path: 'opentok',
    loadChildren: () =>
      import('./opentok/opentok.module').then(m => m.OpentokModule),
  },
  {
    path: '',
    redirectTo: '/hcp/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/hcp/login',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
