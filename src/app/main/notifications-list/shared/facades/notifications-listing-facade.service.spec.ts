import { TestBed } from '@angular/core/testing';

import { NotificationsListingFacadeService } from './notifications-listing-facade.service';

describe('NotificationsListingFacadeService', () => {
  let service: NotificationsListingFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationsListingFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
