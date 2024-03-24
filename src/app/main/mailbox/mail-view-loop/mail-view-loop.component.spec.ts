import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MailboxMailViewLoopComponent} from './mail-view-loop.component';

describe('MailboxMailViewLoopComponent', () => {
  let component: MailboxMailViewLoopComponent;
  let fixture: ComponentFixture<MailboxMailViewLoopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MailboxMailViewLoopComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailboxMailViewLoopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
