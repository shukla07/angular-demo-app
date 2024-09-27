import {TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {of} from 'rxjs';

import {AuthService} from './auth.service';
import {UserSessionStoreService} from '../store/user-session-store.service';
import {APPLICATION_STORE} from '../store/store.interface';
import {InMemoryStorageService} from 'ngx-webstorage-service';
import {ApiService} from '../api/api.service';
import {CurrentUserAdapter} from '@vmsl/core/auth/adapters/current-user-adapter.service';
import {LoginAdapter} from '@vmsl/core/auth/adapters/login-adapter.service';
import {AnyAdapter} from '../api/adapters/any-adapter.service';
import {
  NgxPermissionsService,
  USE_PERMISSIONS_STORE,
  NgxPermissionsStore,
} from 'ngx-permissions';
import {LoginCommand, GetCurrentUserCommand} from './commands';

class Constants {
  static password = 'secret';
}

let authService: AuthService;
let apiServiceSpy: jasmine.SpyObj<ApiService>;
let loginAdapterSpy: jasmine.SpyObj<LoginAdapter>;
let currentUserAdapterSpy: jasmine.SpyObj<CurrentUserAdapter>;
let permissionsServiceSpy: jasmine.SpyObj<NgxPermissionsService>;
let storeServiceSpy: jasmine.SpyObj<UserSessionStoreService>;

describe('AuthService', () => {
  const storeServiceMock = jasmine.createSpyObj('UserSessionStoreService', [
    'setUser',
    'getUser',
  ]);
  const apiServiceMock = jasmine.createSpyObj('ApiService', ['post', 'get']);
  const loginAdapterMock = jasmine.createSpyObj('LoginAdapter', [
    'adaptFromModel',
    'adaptToModel',
  ]);
  const loginCommandMock = jasmine.createSpyObj('LoginCommand', ['execute']);
  const getCurrentUserCommandMock = jasmine.createSpyObj(
    'GetCurrentUserCommand',
    ['execute'],
  );
  const currentUserAdapterMock = jasmine.createSpyObj('CurrentUserAdapter', [
    'adaptFromModel',
    'adaptToModel',
  ]);
  const permissionsServiceMock = jasmine.createSpyObj('NgxPermissionsService', [
    'loadPermissions',
  ]);

  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [],
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        AuthService,
        InMemoryStorageService,
        ApiService,
        AnyAdapter,
        NgxPermissionsStore,
        {provide: APPLICATION_STORE},
        {provide: USE_PERMISSIONS_STORE, useValue: {}},
        {provide: UserSessionStoreService, useValue: storeServiceMock},
        {provide: LoginAdapter, useValue: loginAdapterMock},
        {provide: ApiService, useValue: apiServiceMock},
        {provide: LoginCommand, useValue: loginCommandMock},
        {provide: GetCurrentUserCommand, useValue: getCurrentUserCommandMock},
        {provide: CurrentUserAdapter, useValue: currentUserAdapterMock},
        {provide: NgxPermissionsService, useValue: permissionsServiceMock},
      ],
    }),
  );

  beforeEach(() => {
    authService = TestBed.get(AuthService);
    loginAdapterSpy = TestBed.get(LoginAdapter);
    apiServiceSpy = TestBed.get(ApiService);
    currentUserAdapterSpy = TestBed.get(CurrentUserAdapter);
    permissionsServiceSpy = TestBed.get(NgxPermissionsService);
    storeServiceSpy = TestBed.get(UserSessionStoreService);
  });

  it('should be created', () => {
    expect(authService).toBeTruthy();
  });

  it('should call currentUser method and return success response', () => {
    storeServiceSpy.getUser();
    apiServiceSpy.get.and.returnValue(of({permissions: 'permissions'}));
    authService.currentUser().subscribe(res => {
      expect(res).toEqual({
        userName: 'userName',
        id: 11234,
        permissions: ['abc', 'xyz'],
      });
      expect(apiServiceSpy.get).toHaveBeenCalled();
    });
  });
});
