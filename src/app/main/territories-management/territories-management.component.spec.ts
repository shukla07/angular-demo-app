import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TerritoriesManagementComponent } from './territories-management.component';

describe('TerritoriesManagementComponent', () => {
  let component: TerritoriesManagementComponent;
  let fixture: ComponentFixture<TerritoriesManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TerritoriesManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TerritoriesManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
