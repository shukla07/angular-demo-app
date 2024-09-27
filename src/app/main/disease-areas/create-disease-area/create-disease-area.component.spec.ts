import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDiseaseAreaComponent } from './create-disease-area.component';

describe('CreateDiseaseAreaComponent', () => {
  let component: CreateDiseaseAreaComponent;
  let fixture: ComponentFixture<CreateDiseaseAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateDiseaseAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDiseaseAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
