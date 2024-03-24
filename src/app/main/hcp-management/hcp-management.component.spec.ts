import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HcpManagementComponent } from './hcp-management.component';

describe('HcpManagementComponent', () => {
  let component: HcpManagementComponent;
  let fixture: ComponentFixture<HcpManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HcpManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HcpManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
