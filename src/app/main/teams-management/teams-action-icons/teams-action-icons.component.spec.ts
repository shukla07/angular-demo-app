import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamsActionIconsComponent } from './teams-action-icons.component';

describe('TeamsActionIconsComponent', () => {
  let component: TeamsActionIconsComponent;
  let fixture: ComponentFixture<TeamsActionIconsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamsActionIconsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamsActionIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
