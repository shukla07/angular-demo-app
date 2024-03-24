import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TherapeuticAreasActionIconComponent } from './therapeutic-areas-action-icon.component';

describe('TherapeuticAreasActionIconComponent', () => {
  let component: TherapeuticAreasActionIconComponent;
  let fixture: ComponentFixture<TherapeuticAreasActionIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TherapeuticAreasActionIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TherapeuticAreasActionIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
