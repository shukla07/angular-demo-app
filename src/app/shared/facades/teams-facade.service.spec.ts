import {TestBed} from '@angular/core/testing';

import {TeamsFacadeService} from './teams-facade.service';

describe('TeamsFacadeService', () => {
  let service: TeamsFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeamsFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
