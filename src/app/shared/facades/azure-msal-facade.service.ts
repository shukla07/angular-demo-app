import {Injectable} from '@angular/core';
import {ApiService} from '@vmsl/core/api/api.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {AnyAdapter} from '@vmsl/core/api/adapters/any-adapter.service';
import {GetAzureTenantConfigAdapter} from '../../main/profile/shared/adapters/get-azure-tenant-config-adapter.service';
import {Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';
import {CalendarDesyncCallbackCommand} from '../../main/profile/shared/commands/calendar-desync-callback.command';
import {CalendarTenantConfig} from '../../main/profile/shared/models/tenant-calendar-config.model';
import {GetAzureTenantConfigCommand} from '../../main/profile/shared/commands/get-azure-tenant-config.command';
import {CreateAzureTenantConfig} from '../../main/profile/shared/commands/create-azure-tenant-config.command';
import {UpdateAzureTenantConfig} from '../../main/profile/shared/commands/update-azure-tenant-config.command';
import {CalendarSyncCallbackCommand} from '../../main/profile/shared/commands/calendar-sync-callback.command';
import {MSLoginCallback} from '../../main/profile/shared/commands/ms-login-callback.command';
import {environment} from '@vmsl/env/environment';
import {HttpHeaders} from '@angular/common/http';
import {AuthTokenSkipHeader} from '@vmsl/core/interceptors/auth.interceptor';

@Injectable()
export class AzureMsalFacadeService {
  private readonly authHeaders = new HttpHeaders().set(AuthTokenSkipHeader, '');
  tenantId: string;
  ssoConfig: Object;
  constructor(
    private readonly apiService: ApiService,
    private readonly store: UserSessionStoreService,
    private readonly anyAdapter: AnyAdapter,
    private readonly getAzureConfigAdapter: GetAzureTenantConfigAdapter,
  ) {
    if (this.store.getUser()) {
      this.tenantId = this.store.getUser().tenantId;
    }
  }

  getAzureTenantConfig(): Observable<CalendarTenantConfig> {
    const config = this.store.getCalTenantConfig();
    if (config && config.authClientId) {
      return of(config);
    } else {
      const command: GetAzureTenantConfigCommand<CalendarTenantConfig> = new GetAzureTenantConfigCommand(
        this.apiService,
        this.getAzureConfigAdapter,
        this.tenantId,
      );
      return command
        .execute()
        .pipe(tap(resp => this.store.setCalTenantConfig(resp)));
    }
  }

  createAzureTenantConfig(
    configData: CalendarTenantConfig,
  ): Observable<Object> {
    const command: CreateAzureTenantConfig<Object> = new CreateAzureTenantConfig(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    command.parameters = {
      data: {
        auth_client_id: configData.authClientId,
        auth_client_secret: configData.authClientSecret,
        auth_url: configData.authUrl,
        thumbprint: configData.thumbprint,
        token_url: configData.tokenUrl,
      },
    };
    return command.execute();
  }

  updateAzureTenantConfig(
    configData: CalendarTenantConfig,
  ): Observable<Object> {
    const command: UpdateAzureTenantConfig<object> = new UpdateAzureTenantConfig(
      this.apiService,
      this.anyAdapter,
      this.tenantId,
    );
    command.parameters = {
      data: {
        auth_client_id: configData.authClientId,
        auth_client_secret: configData.authClientSecret,
        auth_url: configData.authUrl,
        thumbprint: configData.thumbprint,
        token_url: configData.tokenUrl,
      },
    };
    return command.execute();
  }

  calendarSyncCallback(idToken): Observable<Object> {
    const command: CalendarSyncCallbackCommand<Object> = new CalendarSyncCallbackCommand(
      this.apiService,
      this.anyAdapter,
    );
    command.parameters = {
      data: {
        userId: this.store.getUser().id,
        tenantId: this.tenantId,
        idToken: idToken,
      },
    };
    return command.execute();
  }

  msLoginCallback(idToken, accessToken): Observable<Object> {
    const command: MSLoginCallback<Object> = new MSLoginCallback(
      this.apiService,
      this.anyAdapter,
    );
    command.parameters = {
      data: {
        clientId: environment.clientId,
        clientSecret: environment.clientSecret,
        idToken: idToken,
        accessToken: accessToken,
      },
      headers: this.authHeaders,
    };
    return command.execute();
  }

  calendarDesyncCallback(): Observable<Object> {
    const command: CalendarDesyncCallbackCommand<Object> = new CalendarDesyncCallbackCommand(
      this.apiService,
      this.anyAdapter,
    );
    command.parameters = {
      data: {
        userId: this.store.getUser().id,
        tenantId: this.tenantId,
      },
    };
    return command.execute();
  }
}
