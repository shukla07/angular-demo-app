import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, Subject, throwError} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';

import {AuthService} from '../auth/auth.service';
import {STATUS_CODE} from '@vmsl/core/api/error-code';
import {UserSessionStoreService as StoreService} from '../store/user-session-store.service';

@Injectable()
export class SessionRecoveryInterceptor implements HttpInterceptor {
  constructor(
    private readonly store: StoreService,
    private readonly sessionService: AuthService,
  ) {}

  private _refreshSubject: Subject<any> = new Subject<any>();

  private _ifTokenExpired() {
    this._refreshSubject.subscribe({
      complete: () => {
        this._refreshSubject = new Subject<any>();
      },
    });
    if (this._refreshSubject.observers.length === 1) {
      this.sessionService.refreshToken().subscribe(this._refreshSubject);
    }
    return this._refreshSubject;
  }

  private _checkTokenExpiryErr(error: HttpErrorResponse): boolean {
    return (
      error.status &&
      error.status === STATUS_CODE.UNAUTHORIZED &&
      error.error &&
      error.error.error &&
      error.error.error.message &&
      error.error.error.message === 'Token is revoked'
    );
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    if (req.url.endsWith('/token-refresh')) {
      return next.handle(req);
    } else {
      return next.handle(req).pipe(
        catchError((error, caught) => {
          if (error instanceof HttpErrorResponse) {
            if (this._checkTokenExpiryErr(error)) {
              return this._ifTokenExpired().pipe(
                switchMap(() => next.handle(this.updateHeader(req))),
              );
            } else {
              return throwError(error);
            }
          }
          return caught;
        }),
      );
    }
  }

  updateHeader(req) {
    const authToken = this.store.getAccessToken();
    if (req.url.endsWith('/logout')) {
      req = req.clone({
        body: {refreshToken: this.store.getRefreshToken()},
        headers: req.headers.set('Authorization', `Bearer ${authToken}`),
      });
    } else {
      req = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${authToken}`),
      });
    }
    return req;
  }
}
