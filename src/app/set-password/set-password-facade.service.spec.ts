import { TestBed } from '@angular/core/testing';

import { SetPasswordFacadeService } from './set-password-facade.service';

describe('SetPasswordFacadeService', () => {
  let service: SetPasswordFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SetPasswordFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
