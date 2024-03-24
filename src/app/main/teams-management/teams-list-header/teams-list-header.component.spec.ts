import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamsListHeaderComponent } from './teams-list-header.component';

describe('TeamsListHeaderComponent', () => {
  let component: TeamsListHeaderComponent;
  let fixture: ComponentFixture<TeamsListHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamsListHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamsListHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
