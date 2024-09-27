import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MailboxSentComponent} from './sent.component';

describe('MailboxSentComponent', () => {
  let component: MailboxSentComponent;
  let fixture: ComponentFixture<MailboxSentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MailboxSentComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailboxSentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
