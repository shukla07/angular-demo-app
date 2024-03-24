import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MailboxImportantComponent} from './important.component';

describe('MailboxImportantComponent', () => {
  let component: MailboxImportantComponent;
  let fixture: ComponentFixture<MailboxImportantComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MailboxImportantComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailboxImportantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
