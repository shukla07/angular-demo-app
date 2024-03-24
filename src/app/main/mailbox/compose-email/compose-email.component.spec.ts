import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MailboxComposeEmailComponent} from './compose-email.component';

describe('MailboxComposeEmailComponent', () => {
  let component: MailboxComposeEmailComponent;
  let fixture: ComponentFixture<MailboxComposeEmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MailboxComposeEmailComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailboxComposeEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
