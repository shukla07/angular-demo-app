import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintMailComponent } from './print-mail.component';

describe('PrintMailComponent', () => {
  let component: PrintMailComponent;
  let fixture: ComponentFixture<PrintMailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintMailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
