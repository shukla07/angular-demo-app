import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ForgotPasswordRoutingModule} from './forgot-password-routing.module';
import {EmailPasswordComponent} from './email/email.component';
import {SetPasswordComponent} from './password/set-password.component';
import {FormsModule} from '@angular/forms';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {SharedModule} from '@vmsl/shared/shared.module';
import {ForgotPasswordService} from './forgot-password.service';

@NgModule({
  declarations: [EmailPasswordComponent, SetPasswordComponent],
  imports: [
    CommonModule,
    SharedModule,
    ForgotPasswordRoutingModule,
    FormsModule,
    ThemeModule.forRoot(),
  ],
  providers: [ForgotPasswordService],
})
export class ForgotPasswordModule {}
