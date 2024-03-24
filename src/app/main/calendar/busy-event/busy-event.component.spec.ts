import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {BusyEventComponent} from './busy-event.component';

describe('BusyEventComponent', () => {
  let component: BusyEventComponent;
  let fixture: ComponentFixture<BusyEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BusyEventComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusyEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
