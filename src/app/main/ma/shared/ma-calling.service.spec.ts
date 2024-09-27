import { TestBed } from '@angular/core/testing';

import { MaCallingService } from './ma-calling.service';

describe('MaCallingService', () => {
  let service: MaCallingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaCallingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
