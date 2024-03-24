import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileAccessRulesComponent } from './profile-access-rules.component';

describe('ProfileAccessRulesComponent', () => {
  let component: ProfileAccessRulesComponent;
  let fixture: ComponentFixture<ProfileAccessRulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileAccessRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileAccessRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
