import {TestBed} from '@angular/core/testing';

import {JobTitlesManagementService} from './job-titles-management.service';

describe('JobTitlesManagementService', () => {
  let service: JobTitlesManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobTitlesManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
