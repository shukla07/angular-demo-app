import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SubscriberComponent} from './subscriber.component';

describe('SubscriberComponent', () => {
  let component: SubscriberComponent;
  let fixture: ComponentFixture<SubscriberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SubscriberComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    const OTSession = jasmine.createSpyObj('OT.Session', ['subscribe']);
    fixture = TestBed.createComponent(SubscriberComponent);
    component = fixture.componentInstance;
    component.session = OTSession;
    component.stream = {} as OT.Stream;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call session.subscribe', () => {
    expect(component.session.subscribe).toHaveBeenCalledWith(
      component.stream,
      jasmine.any(Element),
      jasmine.any(Object),
      jasmine.any(Function),
    );
  });
});
