import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HcpActionIconComponent } from './hcp-action-icon.component';

describe('HcpActionIconComponent', () => {
  let component: HcpActionIconComponent;
  let fixture: ComponentFixture<HcpActionIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HcpActionIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HcpActionIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
