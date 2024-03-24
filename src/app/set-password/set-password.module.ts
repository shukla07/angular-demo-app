import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {SetPasswordRoutingModule} from './set-password.routing.module';
import {OtpComponent} from './otp/otp.component';
import {NgOtpInputModule} from 'ng-otp-input';
import {RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module} from 'ng-recaptcha';
import {SetPasswordComponent} from './password/set-password.component';
import {SetPasswordFacadeService} from './set-password-facade.service';
import {SharedModule} from '@vmsl/shared/shared.module';
import {ForgotPasswordModule} from '../forgot-password/forgot-password.module';
import {CountdownModule} from 'ngx-countdown';
import {environment} from '@vmsl/env/environment';

@NgModule({
  declarations: [OtpComponent, SetPasswordComponent],
  imports: [
    CommonModule,
    SetPasswordRoutingModule,
    ThemeModule.forRoot(),
    NgOtpInputModule,
    RecaptchaV3Module,
    SharedModule,
    ForgotPasswordModule,
    CountdownModule,
  ],
  providers: [
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: environment.recaptchaKey,
    },
    SetPasswordFacadeService,
  ],
})
export class SetPasswordModule {}
