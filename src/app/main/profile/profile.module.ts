import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProfileComponent} from './profile.component';
import {ProfileRoutingModule} from './profile-routing.module';
import {ThemeModule} from '@vmsl/theme/theme.module';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {NgxPermissionsModule} from 'ngx-permissions';
import {QRCodeModule} from 'angularx-qrcode';
import {
  MsalModule,
  MsalInterceptor,
  MSAL_CONFIG,
  MsalService,
  MSAL_CONFIG_ANGULAR,
  MsalAngularConfiguration,
} from '@azure/msal-angular';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {AzureMsalFacadeService} from '../../shared/facades/azure-msal-facade.service';
import {GetAzureTenantConfigAdapter} from './shared/adapters/get-azure-tenant-config-adapter.service';
import {environment} from '@vmsl/env/environment';
import {SharedModule} from '@vmsl/shared/shared.module';
import {NgSelectModule} from '@ng-select/ng-select';
import {ProfileFacadeService} from './shared/profile-facade.service';

export function getConfig(store: UserSessionStoreService) {
  const config = store.getCalTenantConfig();
  const msalConfig = {
    auth: {
      navigateToLoginRequestUrl: true,
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: true, // Set to true for Internet Explorer 11
    },
  };
  msalConfig.auth['clientId'] = config ? config.authClientId : '';
  msalConfig.auth['authority'] = config ? config.tokenUrl : '';
  msalConfig.auth['redirectUri'] = store.getSsoTentConfigs()
    ? `https://${store.getSsoTentConfigs()['url']}/calendar-auth`
    : `${environment.baseUrl}/calendar-auth`;
  return msalConfig;
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
  declarations: [ProfileComponent],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    ThemeModule.forRoot(),
    NgxDropzoneModule,
    NgxPermissionsModule.forChild(),
    QRCodeModule,
    MsalModule,
    SharedModule,
    NgSelectModule,
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
    ProfileFacadeService,
  ],
})
export class ProfileModule {}
