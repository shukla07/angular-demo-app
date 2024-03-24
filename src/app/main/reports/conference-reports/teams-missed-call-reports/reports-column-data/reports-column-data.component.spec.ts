import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsColumnDataComponent } from './reports-column-data.component';

describe('ReportsColumnDataComponent', () => {
  let component: ReportsColumnDataComponent;
  let fixture: ComponentFixture<ReportsColumnDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportsColumnDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportsColumnDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
