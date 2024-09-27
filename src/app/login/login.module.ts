import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginRoutingModule} from './login-routing.module';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {LoginComponent} from './login.component';
import {NgOtpInputModule} from 'ng-otp-input';
import {CountdownModule} from 'ngx-countdown';
import {NbDialogModule} from '@nebular/theme';
import {SharedModule} from '@vmsl/shared/shared.module';
import {
  MsalModule,
  MsalInterceptor,
  MsalAngularConfiguration,
  MSAL_CONFIG,
  MSAL_CONFIG_ANGULAR,
  MsalService,
} from '@azure/msal-angular';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {environment} from '@vmsl/env/environment';
import {AzureMsalFacadeService} from '@vmsl/shared/facades/azure-msal-facade.service';
import {GetAzureTenantConfigAdapter} from '../main/profile/shared/adapters/get-azure-tenant-config-adapter.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';

export function getConfig(store: UserSessionStoreService) {
  return {
    auth: {
      clientId: store.getSsoTentConfigs()
        ? store.getSsoTentConfigs()['clientId']
        : environment.defaultClientId,
      redirectUri: `https://${
        store.getSsoTentConfigs()
          ? store.getSsoTentConfigs()['url']
          : environment.baseUrl
      }/user-auth`,
      authority: `https://login.microsoftonline.com/${
        store.getSsoTentConfigs()
          ? store.getSsoTentConfigs()['msTenantId']
          : environment.defaultTenantId
      }/`,
      navigateToLoginRequestUrl: true,
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: true, // Set to true for Internet Explorer 11
    },
  };
}

function msalAngularConfigFactory(): MsalAngularConfiguration {
  return {
    popUp: false,
    consentScopes: ['user.read', 'openid', 'profile'],
    unprotectedResources: [],
    protectedResourceMap: [
      ['https://graph.microsoft.com/v1.0/me', ['user.read']],
    ],
    extraQueryParameters: {},
  };
}
@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    LoginRoutingModule,
    ThemeModule.forRoot(),
    SharedModule,
    NgOtpInputModule,
    CountdownModule,
    NbDialogModule.forChild(),
    MsalModule,
  ],
  providers: [
    AzureMsalFacadeService,
    GetAzureTenantConfigAdapter,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true,
    },
    {
      provide: MSAL_CONFIG,
      useFactory: getConfig,
      deps: [UserSessionStoreService],
    },
    {
      provide: MSAL_CONFIG_ANGULAR,
      useFactory: msalAngularConfigFactory,
    },
    MsalService,
  ],
})
export class LoginModule {}
