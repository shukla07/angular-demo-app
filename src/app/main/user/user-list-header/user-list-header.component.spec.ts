import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserListHeaderComponent } from './user-list-header.component';

describe('UserListHeaderComponent', () => {
  let component: UserListHeaderComponent;
  let fixture: ComponentFixture<UserListHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserListHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
