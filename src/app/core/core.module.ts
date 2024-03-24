import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {NgModule, Optional, SkipSelf} from '@angular/core';
import {RouterModule} from '@angular/router';
import {NgxPermissionsModule} from 'ngx-permissions';

import {ApiModule} from './api/api.module';
import {AuthModule} from './auth/auth.module';
import {EnsureModuleLoadedOnce} from './ensure-module-loaded-once';
import {HttpInterceptorProviders} from './interceptors';
import {StoreModule} from './store/store.module';

export * from './api/commands';
export * from './models';
export * from './enums';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NgxPermissionsModule.forRoot(),
    HttpClientModule,
    StoreModule,
    AuthModule,
    ApiModule,
    RouterModule,
  ],
  exports: [StoreModule, AuthModule, ApiModule],
  providers: [HttpInterceptorProviders],
})
export class CoreModule extends EnsureModuleLoadedOnce {
  // Ensure that CoreModule is only loaded into AppModule

  // Looks for the module in the parent injector to see if it's already been loaded (only want it loaded once)
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    super(parentModule);
  }
}
