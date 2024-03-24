import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoShowReportsComponent } from './no-show-reports.component';

describe('NoShowReportsComponent', () => {
  let component: NoShowReportsComponent;
  let fixture: ComponentFixture<NoShowReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoShowReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoShowReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
