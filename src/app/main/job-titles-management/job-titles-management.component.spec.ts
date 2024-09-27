import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobTitlesManagementComponent } from './job-titles-management.component';

describe('JobTitlesManagementComponent', () => {
  let component: JobTitlesManagementComponent;
  let fixture: ComponentFixture<JobTitlesManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobTitlesManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobTitlesManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
