import { TestBed } from '@angular/core/testing';

import { RolesAdapter } from './roles-adapter.service';

describe('RolesAdapter', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RolesAdapter = TestBed.get(RolesAdapter);
    expect(service).toBeTruthy();
  });
});
