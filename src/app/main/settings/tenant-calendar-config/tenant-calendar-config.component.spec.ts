import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantCalendarConfigComponent } from './tenant-calendar-config.component';

describe('TenantCalendarConfigComponent', () => {
  let component: TenantCalendarConfigComponent;
  let fixture: ComponentFixture<TenantCalendarConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TenantCalendarConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TenantCalendarConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
