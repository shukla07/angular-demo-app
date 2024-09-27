import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ContentPopupHeaderComponent} from './content-popup-header.component';

describe('ContentPopupHeaderComponent', () => {
  let component: ContentPopupHeaderComponent;
  let fixture: ComponentFixture<ContentPopupHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContentPopupHeaderComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentPopupHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
