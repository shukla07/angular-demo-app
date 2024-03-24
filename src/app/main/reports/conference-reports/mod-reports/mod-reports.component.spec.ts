import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModReportsComponent } from './mod-reports.component';

describe('ModReportsComponent', () => {
  let component: ModReportsComponent;
  let fixture: ComponentFixture<ModReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
