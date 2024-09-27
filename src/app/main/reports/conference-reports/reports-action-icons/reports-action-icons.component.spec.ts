import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsActionIconsComponent } from './reports-action-icons.component';

describe('ReportsActionIconsComponent', () => {
  let component: ReportsActionIconsComponent;
  let fixture: ComponentFixture<ReportsActionIconsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportsActionIconsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportsActionIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
