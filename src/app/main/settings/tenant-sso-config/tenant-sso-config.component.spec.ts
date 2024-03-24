import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {TenantSsoConfigComponent} from './tenant-sso-config.component';

describe('TenantSsoConfigComponent', () => {
  let component: TenantSsoConfigComponent;
  let fixture: ComponentFixture<TenantSsoConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TenantSsoConfigComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TenantSsoConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
