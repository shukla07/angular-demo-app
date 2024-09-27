import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MailboxInboxComponent} from './inbox.component';

describe('MailboxInboxComponent', () => {
  let component: MailboxInboxComponent;
  let fixture: ComponentFixture<MailboxInboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MailboxInboxComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailboxInboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
