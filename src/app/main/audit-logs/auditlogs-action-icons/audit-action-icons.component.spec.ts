import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditActionIconsComponent } from './audit-action-icons.component';

describe('AuditActionIconsComponent', () => {
  let component: AuditActionIconsComponent;
  let fixture: ComponentFixture<AuditActionIconsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuditActionIconsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditActionIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
