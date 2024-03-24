import { TestBed } from '@angular/core/testing';

import { HcpFacadeService } from './hcp-facade.service';

describe('HcpFacadeService', () => {
  let service: HcpFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HcpFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
