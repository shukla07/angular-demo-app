import { TestBed } from '@angular/core/testing';

import { HcpManagementService } from './hcp-management.service';

describe('HcpManagementService', () => {
  let service: HcpManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HcpManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
