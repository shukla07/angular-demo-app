import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MailboxTrashComponent} from './trash.component';

describe('MailboxTrashComponent', () => {
  let component: MailboxTrashComponent;
  let fixture: ComponentFixture<MailboxTrashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MailboxTrashComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailboxTrashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
