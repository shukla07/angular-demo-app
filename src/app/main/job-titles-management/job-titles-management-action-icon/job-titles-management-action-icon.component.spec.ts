import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {JobTitlesManagementActionIconComponent} from './job-titles-management-action-icon.component';

describe('JobTitlesManagementActionIconComponent', () => {
  let component: JobTitlesManagementActionIconComponent;
  let fixture: ComponentFixture<JobTitlesManagementActionIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [JobTitlesManagementActionIconComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobTitlesManagementActionIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
