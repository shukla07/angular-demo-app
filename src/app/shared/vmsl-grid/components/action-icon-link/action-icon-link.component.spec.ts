import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionIconLinkComponent } from './action-icon-link.component';

describe('ActionIconLinkComponent', () => {
  let component: ActionIconLinkComponent;
  let fixture: ComponentFixture<ActionIconLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActionIconLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionIconLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
