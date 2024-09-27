import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiseaseAreasActionIconComponent } from './disease-areas-action-icon.component';

describe('DiseaseAreasActionIconComponent', () => {
  let component: DiseaseAreasActionIconComponent;
  let fixture: ComponentFixture<DiseaseAreasActionIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiseaseAreasActionIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiseaseAreasActionIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
