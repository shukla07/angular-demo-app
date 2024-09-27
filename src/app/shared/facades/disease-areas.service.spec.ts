import { TestBed } from '@angular/core/testing';

import { DiseaseAreasService } from './disease-areas.service';

describe('DiseaseAreasService', () => {
  let service: DiseaseAreasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiseaseAreasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
