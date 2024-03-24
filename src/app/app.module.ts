import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {NbEvaIconsModule} from '@nebular/eva-icons';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CoreModule} from './core/core.module';
import {ThemeModule} from './theme/theme.module';
import {ToastrModule} from 'ngx-toastr';
import {
  NgxUiLoaderModule,
  NgxUiLoaderConfig,
  NgxUiLoaderRouterModule,
  NgxUiLoaderHttpModule,
} from 'ngx-ui-loader';
import {PubNubAngular} from 'pubnub-angular2';
import {environment} from '@vmsl/env/environment';
import {LoginService} from './login/login.service';

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  bgsColor: '#da0000',
  fastFadeOut: true,
  fgsColor: '#da0000',
  pbColor: '#da0000',
  overlayColor: 'rgba(255, 255, 255, 0.6)',
};

// sonarignore:start
export function initializerFactory(loginService: LoginService): any {
  // sonarignore:end
  // APP_INITIALIZER, except a function return which will return a promise
  // APP_INITIALIZER, angular doesnt starts application untill it completes
  const promise = loginService
    .getTenantIdForSSO(window.location.hostname)
    .toPromise()
    .then();
  return () => promise;
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    BrowserAnimationsModule,
    ThemeModule.forRoot(),
    NbEvaIconsModule,
    ToastrModule.forRoot({
      preventDuplicates: true,
      positionClass: 'toast-bottom-right',
    }),
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    NgxUiLoaderRouterModule,
    NgxUiLoaderHttpModule.forRoot({
      showForeground: true,
      excludeRegexp: [
        `${environment.userApiUrl}/tenants/[a-zA-Z0-9].*/ma-search`,
        `${environment.userApiUrl}/tenants/[a-zA-Z0-9].*/in-mails/messages/inbox*`,
        `${environment.userApiUrl}/tenants/[a-zA-Z0-9].*/in-mails/messages/send*`,
        `${environment.userApiUrl}/tenants/[a-zA-Z0-9].*/users$`,
        `${environment.chatApiUrl}/tenants/[a-zA-Z0-9].*/chats$`,
        `${environment.chatApiUrl}/tenants/[a-zA-Z0-9].*/chats/channels$`,
        `${environment.userApiUrl}/tenants/[a-zA-Z0-9].*/contents*`,
        `${environment.chatApiUrl}/tenants/[a-zA-Z0-9].*/chats/mark-conversation`,
        `${environment.chatApiUrl}/tenants/[a-zA-Z0-9].*/chats/signal`,
        `${environment.chatApiUrl}/tenants/[a-zA-Z0-9].*/chats/upload-file`,
        `${environment.userApiUrl}/cal-sync/callback`
      ],
    }),
  ],
  providers: [
    PubNubAngular,
    {
      provide: APP_INITIALIZER,
      useFactory: initializerFactory,
      deps: [LoginService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
