import {Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import {Observable, of} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {AuthService} from './auth.service';
import {UserSessionStoreService} from '../store/user-session-store.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly store: UserSessionStoreService,
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> {
    return this.checkLogin(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> {
    return this.checkLogin(state.url);
  }

  canLoad(route: Route): Observable<boolean> {
    return this.checkLogin(`/${route.path}`);
  }

  private checkLogin(url: string): Observable<boolean> {
    return this.authService.isLoggedIn().pipe(
      tap(res => {
        if (!res) {
          this.store.clearAll();
          this.store.setMessage('sessionExpire');
          this.router.navigate(['/']);
        }
      }),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(false);
      }),
    );
  }
}
