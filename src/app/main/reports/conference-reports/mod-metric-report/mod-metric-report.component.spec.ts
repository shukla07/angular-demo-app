import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ModMetricReportComponent} from './mod-metric-report.component';

describe('ModMetricReportComponent', () => {
  let component: ModMetricReportComponent;
  let fixture: ComponentFixture<ModMetricReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModMetricReportComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModMetricReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
