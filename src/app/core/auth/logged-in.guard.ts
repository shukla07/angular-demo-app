import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';

import {AuthService} from './auth.service';
import {environment} from '@vmsl/env/environment';
import {tap, catchError} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {UserSessionStoreService} from '../store/user-session-store.service';

@Injectable({
  providedIn: 'root',
})
export class LoggedInGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly store: UserSessionStoreService,
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.isLoggedIn().pipe(
      tap(res => {
        if (res) {
          this.router.navigate([environment.homePath]);
        } else {
          this.store.clearAll();
          this.store.setMessage('sessionExpire');
          this.router.navigate(['/login']);
        }
      }),
      catchError(() => {
        this.store.removelastActivity();
        return of(true);
      }),
    );
  }
}
