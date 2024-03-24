import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTherapeuticAreaComponent } from './create-therapeutic-area.component';

describe('CreateTherapeuticAreaComponent', () => {
  let component: CreateTherapeuticAreaComponent;
  let fixture: ComponentFixture<CreateTherapeuticAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateTherapeuticAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTherapeuticAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
