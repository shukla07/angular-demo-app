import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MailboxDraftedEmailComponent} from './drafted-email.component';

describe('MailboxDraftedEmailComponent', () => {
  let component: MailboxDraftedEmailComponent;
  let fixture: ComponentFixture<MailboxDraftedEmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MailboxDraftedEmailComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailboxDraftedEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
