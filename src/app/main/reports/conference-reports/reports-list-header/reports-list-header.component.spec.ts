import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsListHeaderComponent } from './reports-list-header.component';

describe('ReportsListHeaderComponent', () => {
  let component: ReportsListHeaderComponent;
  let fixture: ComponentFixture<ReportsListHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportsListHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportsListHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
