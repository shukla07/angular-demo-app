import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {HcpRegistrationRoutingModule} from './hcp-registration-routing.module';
import {RegistrationComponent} from './registration/registration.component';
import {HcpLoginComponent} from './hcp-login/hcp-login.component';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {SharedModule} from '@vmsl/shared/shared.module';
import {NgxMatIntlTelInputModule} from 'ngx-mat-intl-tel-input';
import {HcpFacadeService} from './shared/facades/hcp-facade.service';
import {RegisterHcpAdapter} from './shared/adapters/register-hcp-adapter.service';
import {NgOtpInputModule} from 'ng-otp-input';
import {CountdownModule} from 'ngx-countdown';
import {RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module} from 'ng-recaptcha';
import {environment} from '@vmsl/env/environment';

@NgModule({
  declarations: [RegistrationComponent, HcpLoginComponent],
  imports: [
    CommonModule,
    ThemeModule.forRoot(),
    HcpRegistrationRoutingModule,
    SharedModule,
    NgxMatIntlTelInputModule,
    NgOtpInputModule,
    CountdownModule,
    RecaptchaV3Module,
  ],
  providers: [
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: environment.recaptchaKey,
    },
    HcpFacadeService,
    RegisterHcpAdapter,
  ],
})
export class HcpRegistrationModule {}
