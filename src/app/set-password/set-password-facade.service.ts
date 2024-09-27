import {Injectable} from '@angular/core';
import {ApiService} from '@vmsl/core/api/api.service';
import {AnyAdapter} from '@vmsl/core/api/adapters/any-adapter.service';
import {Observable} from 'rxjs/internal/Observable';
import {RequestOtpCommand} from './commands/request-otp.command';
import {HttpHeaders} from '@angular/common/http';
import {AuthTokenSkipHeader} from '@vmsl/core/interceptors/auth.interceptor';
import {SubmitOtpCommand} from './commands/submit-otp.command';
import {VerifyLinkCommand} from './commands/verify-link.command';
import {HcpLoginCommand} from '../hcp-registration/shared/commands/hcp-login-command';
import {environment} from '@vmsl/env/environment';

@Injectable()
export class SetPasswordFacadeService {
  private readonly authHeaders = new HttpHeaders().set(AuthTokenSkipHeader, '');
  constructor(
    private readonly apiService: ApiService,
    private readonly anyAdapter: AnyAdapter,
  ) {}

  // sonarignore:start
  public requestOtp(token: string, captchaToken: string): Observable<any> {
    const command: RequestOtpCommand<any> = new RequestOtpCommand(
      this.apiService,
      this.anyAdapter,
    );
    // sonarignore:end
    const body = {
      token,
      captchaToken,
    };
    command.parameters = {
      data: body,
      headers: this.authHeaders,
    };
    return command.execute();
  }

  public getOtpforHcpRegister(
    username: string,
    captchaToken,
  ): Observable<Object> {
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
  submitOtpForHcp(username: string, otp: string): Observable<any> {
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

  // sonarignore:start
  submitOtpForSponsor(token: string, otp: string): Observable<any> {
    const command: SubmitOtpCommand<any> = new SubmitOtpCommand(
      this.apiService,
      this.anyAdapter,
      token,
    );
    // sonarignore:end
    command.parameters = {
      data: {
        otp: otp,
      },
      headers: this.authHeaders,
    };
    return command.execute();
  }

  // sonarignore:start
  verifyEmailLink(token: string) {
    const command: VerifyLinkCommand<any> = new VerifyLinkCommand(
      this.apiService,
      this.anyAdapter,
      token,
    );
    // sonarignore:end

    command.parameters = {
      headers: this.authHeaders,
    };

    return command.execute();
  }
}
