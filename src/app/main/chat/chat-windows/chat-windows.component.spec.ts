import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ChatWindowsComponent} from './chat-windows.component';

describe('ChatWindowsComponent', () => {
  let component: ChatWindowsComponent;
  let fixture: ComponentFixture<ChatWindowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChatWindowsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatWindowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
