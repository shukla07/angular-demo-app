import {CurrentUserAdapter} from '@vmsl/core/auth/adapters/current-user-adapter.service';
import {LoginAdapter} from '@vmsl/core/auth/adapters/login-adapter.service';
import {HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {NgxPermissionsService} from 'ngx-permissions';
import {Observable, of, throwError} from 'rxjs';
import {catchError, switchMap, tap} from 'rxjs/operators';
import {AnyAdapter} from '../api/adapters/any-adapter.service';
import {ApiService} from '../api/api.service';
import {AuthTokenSkipHeader} from '../interceptors/auth.interceptor';
import {UserSessionStoreService as StoreService} from '../store/user-session-store.service';
import {
  GetCurrentUserCommand,
  LoginCommand,
  RefreshTokenCommand,
  GetTokenCommand,
} from './commands';
import {LoginModel} from './models/login.model';
import {environment} from '@vmsl/env/environment';
import {LogoutCommand} from './commands/logout.command';
import {UserInfo} from './models/user.model';
import {PubNubAngular} from 'pubnub-angular2';
import * as moment from 'moment';
import * as FullStory from '@fullstory/browser';

@Injectable()
export class AuthService {
  redirectUrl: string;
  private readonly authHeaders = new HttpHeaders().set(AuthTokenSkipHeader, '');
  constructor(
    private readonly router: Router,
    private readonly store: StoreService,
    private readonly apiService: ApiService,
    private readonly currentUserAdapter: CurrentUserAdapter,
    private readonly loginAdapter: LoginAdapter,
    private readonly anyAdapter: AnyAdapter,
    private readonly permissionsService: NgxPermissionsService,
    private readonly pubnub: PubNubAngular,
  ) {}
  public isLoggedIn(): Observable<boolean> {
    const sessionTime = 720;
    const lastActivity = moment().diff(
      moment(this.store.getlastActivity()).format(),
      'minutes',
    );
    return this.currentUser().pipe(
      switchMap(user => {
        if (lastActivity < sessionTime && user && user.id) {
          return of(true);
        } else {
          return of(false);
        }
      }),
    );
  }

  public currentUser(): Observable<UserInfo> {
    const user = this.store.getUser();
    if (user && user.id) {
      this.permissionsService.loadPermissions(user.permissions);
      return of(user);
    } else {
      const command: GetCurrentUserCommand<UserInfo> = new GetCurrentUserCommand(
        this.apiService,
        this.currentUserAdapter,
      );
      return command.execute().pipe(
        tap(res => {
          this.permissionsService.loadPermissions(res.permissions);
          this.store.setUser(res);
          if (environment.orgId) {
            this.subscribeToFS();
          }
        }),
      );
    }
  }
  // sonarignore:start
  public login(username: string, password: string): Observable<any> {
    // sonarignore:end
    this.store.setUser({
      username,
    } as UserInfo);
    const command: LoginCommand<LoginModel> = new LoginCommand(
      this.apiService,
      this.loginAdapter,
    );
    command.parameters = {
      data: {
        username: username.toLowerCase(),
        password,
        clientId: environment.clientId,
        clientSecret: environment.clientSecret,
      },
      observe: 'response',
      headers: this.authHeaders,
    };
    return command.execute();
  }
  // sonarignore:start
  public authorize(secret: string, otp?: string): Observable<any> {
    const user = this.store.getUser();
    if (!user.username) {
      this.router.navigate(['login']);
    }
    const command: GetTokenCommand<any> = new GetTokenCommand(
      this.apiService,
      this.anyAdapter,
    );
    // sonarignore:end
    command.parameters = {
      data: {
        username: user.username.toLowerCase(),
        clientId: environment.clientId,
        code: secret,
      },
      headers: this.authHeaders,
    };
    if (otp) {
      command.parameters.data.otp = otp;
    }
    return command.execute();
  }
  // sonarignore:start
  public refreshToken(): Observable<any> {
    const refreshToken = this.store.getRefreshToken();
    if (!refreshToken) {
      return of(false);
    }
    const command: RefreshTokenCommand<any> = new RefreshTokenCommand(
      this.apiService,
      this.anyAdapter,
    );
    // sonarignore:end
    command.parameters = {
      data: {
        refreshToken,
      },
    };
    return command
      .execute()
      .pipe(
        tap(response => {
          if (response.accessToken && response.refreshToken) {
            this.store.removeAccessToken();
            this.store.removeRefreshToken();
            this.store.saveAccessToken(response.accessToken);
            this.store.saveRefreshToken(response.refreshToken);
          }
        }),
      )
      .pipe(catchError(err => this.handleError(err)));
  }
  // sonarignore:start
  public logout(): Observable<any> {
    const delay = 1000;
    const refreshToken = this.store.getRefreshToken();
    const command: LogoutCommand<any> = new LogoutCommand(
      this.apiService,
      this.anyAdapter,
    );
    const loginUrl = '/login';
    // sonarignore:start
    command.parameters = {
      data: {
        refreshToken,
      },
    };
    return command.execute().pipe(
      tap(
        res => {
          this.clearAllData();
          setTimeout(() => {
            window.location.href = loginUrl;
            this.store.setlastActivity(new Date());
          }, delay);
        },
        err => {
          this.clearAllData();
          setTimeout(() => {
            window.location.href = loginUrl;
          }, delay);
        },
      ),
    );
  }

  private handleError(error: HttpErrorResponse) {
    const paths = ['/login', '/hcp/login'];
    this.store.clearAll();
    this.store.setMessage('sessionExpire');
    if (paths.indexOf(window.location.pathname) === -1) {
      window.location.href = '/login';
    }
    return throwError('Something bad happened; please try again later.');
  }

  private subscribeToFS() {
    const userId = this.store.getUser().id;
    const userName = this.store.getUser().username;
    FullStory.identify(userId, {displayName: userName});
  }

  private clearAllData() {
    this.pubnub.unsubscribeAll();
    this.permissionsService.flushPermissions();
    this.store.clearAll();
  }
}
