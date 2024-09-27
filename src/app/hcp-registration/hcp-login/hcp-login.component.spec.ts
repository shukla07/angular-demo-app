import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HcpLoginComponent } from './hcp-login.component';

describe('HcpLoginComponent', () => {
  let component: HcpLoginComponent;
  let fixture: ComponentFixture<HcpLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HcpLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HcpLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
