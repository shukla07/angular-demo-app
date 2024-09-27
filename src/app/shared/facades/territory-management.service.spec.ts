import { TestBed } from '@angular/core/testing';

import { TerritoryManagementService } from './territory-management.service';

describe('TerritoryManagementService', () => {
  let service: TerritoryManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TerritoryManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
