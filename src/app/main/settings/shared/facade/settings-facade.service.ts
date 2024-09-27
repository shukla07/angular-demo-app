import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from '@vmsl/core/api/api.service';
import {AnyAdapter} from '@vmsl/core/api/adapters/any-adapter.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {ResetPasswordCommand} from '../commands/reset-password.command';
import {GetTenantSsoConfigCommand} from '../commands/get-tenant-sso-config.command';
import {SaveTenantSsoConfig} from '../commands/save-tenant-sso-config.command';

@Injectable()
export class SettingsFacadeService {
  constructor(
    private readonly apiService: ApiService,
    private readonly anyAdapter: AnyAdapter,
    private readonly store: UserSessionStoreService,
  ) {}

  // sonarignore:start
  resetPassword(userData): Observable<any> {
    const command: ResetPasswordCommand<any> = new ResetPasswordCommand(
      this.apiService,
      this.anyAdapter,
    );
    // sonarignore:end

    command.parameters = {
      data: {
        refreshToken: this.store.getRefreshToken(),
        username: userData.email,
        oldPassword: userData.currentPassword,
        password: userData.newPassword,
      },
    };
    return command.execute();
  }
  getTenantSsoConfig(tenantId) {
    const command: GetTenantSsoConfigCommand<{
      isSsoAllowed: boolean;
      msTenantId: string;
    }> = new GetTenantSsoConfigCommand(
      this.apiService,
      this.anyAdapter,
      tenantId,
    );
    return command.execute();
  }

  saveTenantSsoConfig(data, tenantId) {
    const command: SaveTenantSsoConfig<{
      success: boolean;
    }> = new SaveTenantSsoConfig(this.apiService, this.anyAdapter, tenantId);
    command.parameters = {data};
    return command.execute();
  }
}
