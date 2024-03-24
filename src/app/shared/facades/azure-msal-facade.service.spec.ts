import { TestBed } from '@angular/core/testing';
import { AzureMsalFacadeService } from './azure-msal-facade.service';


describe('AzureMsalFacadeService', () => {
  let service: AzureMsalFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AzureMsalFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
