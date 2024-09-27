import {
  HttpBackend,
  HttpClient,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AuthTokenSkipHeader} from '@vmsl/core/interceptors/auth.interceptor';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {environment} from '@vmsl/env/environment';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  ssoConfig: Object;
  http: HttpClient;
  constructor(
    private readonly store: UserSessionStoreService,
    private readonly httpHandler: HttpBackend,
  ) {
    this.http = new HttpClient(httpHandler);
  }
  private readonly authHeaders = new HttpHeaders().set(AuthTokenSkipHeader, '');
  //sonarignore:start
  getTenantIdForSSO(currentUrl): Observable<object> {
    const params = new HttpParams();
    return this.http
      .get(`${environment.authApiUrl}/tenant-landing-page`, {
        headers: this.authHeaders,
        observe: 'body',
        params: params.set(
          'filter',
          JSON.stringify({where: {url: currentUrl}}),
        ),
      })
      .pipe(
        tap(resp => {
          this.store.setSsoTentConfigs(resp);
          if (resp) {
            this.ssoConfig = resp;
          } else {
            this.ssoConfig = {};
          }
        }),
      );
  }
}
