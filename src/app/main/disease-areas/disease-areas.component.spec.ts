import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiseaseAreasComponent } from './disease-areas.component';

describe('DiseaseAreasComponent', () => {
  let component: DiseaseAreasComponent;
  let fixture: ComponentFixture<DiseaseAreasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiseaseAreasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiseaseAreasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
