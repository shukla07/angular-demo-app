import {Injectable} from '@angular/core';
import {ApiService} from '@vmsl/core/api/api.service';
import {AnyAdapter} from '@vmsl/core/api/adapters/any-adapter.service';
import {Observable} from 'rxjs';
import {HcpLoginCommand} from '../commands/hcp-login-command';
import {environment} from '@vmsl/env/environment';
import {HttpHeaders} from '@angular/common/http';
import {AuthTokenSkipHeader} from '@vmsl/core/interceptors/auth.interceptor';
import {UserInfo} from '@vmsl/core/auth/models/user.model';
import {RegisterHcpCommand} from '../commands/register-hcp-command';
import {RegisterHcpAdapter} from '../adapters/register-hcp-adapter.service';
import {GetTenantsListCommand} from '../commands/get-tenants-command';
import {TenantsModel} from '../models/tenants.model';

@Injectable()
export class HcpFacadeService {
  private readonly authHeaders = new HttpHeaders().set(AuthTokenSkipHeader, '');
  constructor(
    private readonly apiService: ApiService,
    private readonly anyAdapter: AnyAdapter,
    private readonly registerHcpAdapter: RegisterHcpAdapter,
  ) {}

  public getOtpforHcpLogin(username: string, captchaToken): Observable<Object> {
    const command: HcpLoginCommand<Object> = new HcpLoginCommand(
      this.apiService,
      this.anyAdapter,
    );
    command.parameters = {
      data: {
        clientId: environment.clientId,
        clientSecret: environment.clientSecret,
        username: username.toLowerCase(),
        captchaToken,
      },
      observe: 'body',
      headers: this.authHeaders,
    };
    return command.execute();
  }

  // sonarignore:start
  authorizeHcp(username: string, otp: string): Observable<any> {
    const command: HcpLoginCommand<any> = new HcpLoginCommand(
      this.apiService,
      this.anyAdapter,
    );
    // sonarignore:end
    command.parameters = {
      data: {
        clientId: environment.clientId,
        clientSecret: environment.clientSecret,
        username: username.toLowerCase(),
        otp: otp,
      },
      observe: 'body',
      headers: this.authHeaders,
    };
    return command.execute();
  }

  registerHcp(hcpInfo): Observable<UserInfo> {
    const command: RegisterHcpCommand<UserInfo> = new RegisterHcpCommand(
      this.apiService,
      this.registerHcpAdapter,
    );
    command.parameters = {
      observe: 'body',
      data: hcpInfo,
      headers: this.authHeaders,
    };
    return command.execute();
  }

  getTenantsList(): Observable<TenantsModel[]> {
    const command: GetTenantsListCommand<TenantsModel> = new GetTenantsListCommand(
      this.apiService,
      this.anyAdapter,
    );
    command.parameters = {
      headers: this.authHeaders,
    };
    return command.execute();
  }
}
