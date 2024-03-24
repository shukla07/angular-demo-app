import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TherapeuticAreasManagementComponent } from './therapeutic-areas-management.component';

describe('TherapeuticAreasManagementComponent', () => {
  let component: TherapeuticAreasManagementComponent;
  let fixture: ComponentFixture<TherapeuticAreasManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TherapeuticAreasManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TherapeuticAreasManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
