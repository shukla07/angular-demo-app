import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobTitleHeaderComponent } from './job-title-header.component';

describe('TeamsListHeaderComponent', () => {
  let component: JobTitleHeaderComponent;
  let fixture: ComponentFixture<JobTitleHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobTitleHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobTitleHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
