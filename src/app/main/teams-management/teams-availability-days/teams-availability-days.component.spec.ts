import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamsAvailabilityDaysComponent } from './teams-availability-days.component';

describe('TeamsAvailabilityDaysComponent', () => {
  let component: TeamsAvailabilityDaysComponent;
  let fixture: ComponentFixture<TeamsAvailabilityDaysComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamsAvailabilityDaysComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamsAvailabilityDaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
