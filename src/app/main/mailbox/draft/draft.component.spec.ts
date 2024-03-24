import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MailboxDraftComponent} from './draft.component';

describe('MailboxDraftComponent', () => {
  let component: MailboxDraftComponent;
  let fixture: ComponentFixture<MailboxDraftComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MailboxDraftComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailboxDraftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
