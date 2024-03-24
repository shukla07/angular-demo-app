import { TestBed } from '@angular/core/testing';

import { LoginAdapter } from './login-adapter.service';

describe('LoginAdapter', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoginAdapter = TestBed.get(LoginAdapter);
    expect(service).toBeTruthy();
  });
});
