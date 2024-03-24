import { TestBed } from '@angular/core/testing';

import { TherapeuticAreasService } from './therapeutic-areas.service';

describe('TherapeuticAreasService', () => {
  let service: TherapeuticAreasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TherapeuticAreasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
