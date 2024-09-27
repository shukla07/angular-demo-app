import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TerritoriesManagementActionIconComponent } from './territories-management-action-icon.component';

describe('TerritoriesManagementActionIconComponent', () => {
  let component: TerritoriesManagementActionIconComponent;
  let fixture: ComponentFixture<TerritoriesManagementActionIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TerritoriesManagementActionIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TerritoriesManagementActionIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
