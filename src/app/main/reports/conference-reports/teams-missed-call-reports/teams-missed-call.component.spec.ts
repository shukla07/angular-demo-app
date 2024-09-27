import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamsMissedCallComponent } from './teams-missed-call.component';

describe('TeamsMissedCallComponent', () => {
  let component: TeamsMissedCallComponent;
  let fixture: ComponentFixture<TeamsMissedCallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamsMissedCallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamsMissedCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
