import {Injectable} from '@angular/core';
import {ApiService} from '@vmsl/core/api/api.service';
import {AnyAdapter} from '@vmsl/core/api/adapters/any-adapter.service';
import {Observable} from 'rxjs';
import {ForgotPasswordCommand} from './commands/forgot-password.command';
import {environment} from '@vmsl/env/environment';
import {SetPasswordCommand} from './commands/set-password.command';
import {HttpHeaders} from '@angular/common/http';
import {AuthTokenSkipHeader} from '@vmsl/core/interceptors/auth.interceptor';

@Injectable()
export class ForgotPasswordService {
  private readonly authHeaders = new HttpHeaders().set(AuthTokenSkipHeader, '');
  constructor(
    private readonly apiService: ApiService,
    private readonly anyAdapter: AnyAdapter,
  ) {}

  // sonarignore:start
  public forgotPassword(username: string): Observable<any> {
    const command: ForgotPasswordCommand<any> = new ForgotPasswordCommand(
      this.apiService,
      this.anyAdapter,
    );
    // sonarignore:end
    command.parameters = {
      data: {
        username: username.toLowerCase(),
        client_id: environment.clientId,
        client_secret: environment.clientSecret,
      },
      observe: 'body',
      headers: this.authHeaders,
    };
    return command.execute();
  }

  // sonarignore:start
  public setPassword(password: string, token: string): Observable<any> {
    const command: SetPasswordCommand<any> = new SetPasswordCommand(
      this.apiService,
      this.anyAdapter,
    );
    // sonarignore:end
    command.parameters = {
      data: {
        token: token,
        password: password,
        client_id: environment.clientId,
        client_secret: environment.clientSecret,
      },
      observe: 'body',
      headers: this.authHeaders,
    };
    return command.execute();
  }
}
