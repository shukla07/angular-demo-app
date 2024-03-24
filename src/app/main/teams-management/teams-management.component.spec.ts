import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamsManagementComponent } from './teams-management.component';

describe('TeamsManagementComponent', () => {
  let component: TeamsManagementComponent;
  let fixture: ComponentFixture<TeamsManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamsManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
