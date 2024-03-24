import {TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {HTTP_INTERCEPTORS, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';
import {Location} from '@angular/common';

import {AuthInterceptor, AuthTokenSkipHeader} from './auth.interceptor';
import {UserSessionStoreService} from '../store/user-session-store.service';
import {APPLICATION_STORE} from '../store/store.interface';
import {InMemoryStorageService} from 'ngx-webstorage-service';
import {ApiService} from '../api/api.service';

class RouterStub {
  url: '/dashboard';
  navigate(route) {}
}

let httpMock: HttpTestingController;
let apiServiceSpy: jasmine.SpyObj<ApiService>;
let storeServiceSpy: jasmine.SpyObj<UserSessionStoreService>;
let router: jasmine.SpyObj<Router>;
let location: jasmine.SpyObj<Location>;

describe('AuthInterceptor', () => {
  const storeServiceMock = jasmine.createSpyObj('UserSessionStoreService', [
    'getAccessToken',
  ]);

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        UserSessionStoreService,
        InMemoryStorageService,
        ApiService,
        {provide: APPLICATION_STORE},
        {provide: UserSessionStoreService, useValue: storeServiceMock},
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true,
        },
        {provide: Router, useClass: RouterStub},
      ],
    }),
  );

  beforeEach(() => {
    httpMock = TestBed.get(HttpTestingController);
    apiServiceSpy = TestBed.get(ApiService);
    storeServiceSpy = TestBed.get(UserSessionStoreService);
    router = TestBed.get(Router);
    location = TestBed.get(Location);
  });

  it('should be created', () => {
    expect(httpMock).toBeTruthy();
  });

  it('should add an Authorization header', () => {
    storeServiceSpy.getAccessToken.and.returnValue('testToken');
    apiServiceSpy.post('/abc', null).subscribe(response => {
      expect(response).toBeTruthy();
    });
    const req = httpMock.expectOne(
      r =>
        r.headers.has('Authorization') &&
        r.headers.get('Authorization') === 'Bearer testToken',
    );
    expect(req.request.method).toEqual('POST');

    req.flush({hello: 'world'});
    httpMock.verify();
  });

  it('should not add an Authorization header if AuthTokenSkipHeader is there in headers', () => {
    let headers = new HttpHeaders();
    headers = headers
      .set(AuthTokenSkipHeader, 'xyz')
      .set('Content-Type', 'application/x-www-form-urlencoded');

    const options = {};
    options['headers'] = headers;
    storeServiceSpy.getAccessToken.and.returnValue(null);
    apiServiceSpy.post('/abc', null, options).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(r => !r.headers.has('Authorization'));
    expect(req.request.method).toEqual('POST');

    req.flush({hello: 'world'});
    httpMock.verify();
  });

  it('should navigate to login page if access token is not available', () => {
    storeServiceSpy.getAccessToken.and.returnValue(null);
    spyOn(router, 'navigate');
    apiServiceSpy.post('/abc', null).subscribe(response => {
      expect(response).toBeTruthy();
    });
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
