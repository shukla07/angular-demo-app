import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteMailComponent } from './delete-mail.component';

describe('DeleteMailComponent', () => {
  let component: DeleteMailComponent;
  let fixture: ComponentFixture<DeleteMailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteMailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
