import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {PublisherComponent} from './publisher.component';
import {OpentokService} from '../shared/opentok.service';

describe('PublisherComponent', () => {
  let component: PublisherComponent;
  let fixture: ComponentFixture<PublisherComponent>;
  const publisher = {};
  const OT = {
    initPublisher() {},
  };
  const opentokServiceStub = {
    getOT() {
      return OT;
    },
  };

  beforeEach(async(() => {
    spyOn(OT, 'initPublisher').and.callFake(() => publisher);
    TestBed.configureTestingModule({
      declarations: [PublisherComponent],
      providers: [{provide: OpentokService, useValue: opentokServiceStub}],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublisherComponent);
    component = fixture.componentInstance;
    component.session = jasmine.createSpyObj('OT.Session', ['on', 'publish']);
    component.session['isConnected'] = () => false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call OT.initPublisher', () => {
    expect(OT.initPublisher).toHaveBeenCalledWith(jasmine.any(Element), {
      insertMode: 'append',
    });
  });

  it('should call publish on the session when receiving sessionConnected', () => {
    expect(component.session.publish).not.toHaveBeenCalled();
    expect(component.session.on).toHaveBeenCalledWith(
      'sessionConnected',
      jasmine.any(Function),
    );
    // sonarignore:start
    (component.session.on as any).calls.mostRecent().args[1](); // Execute the event handler
    // sonarignore:end
    expect(component.session.publish).toHaveBeenCalledWith(
      publisher,
      jasmine.any(Function),
    );
  });
});
