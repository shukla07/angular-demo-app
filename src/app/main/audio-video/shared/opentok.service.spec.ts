import {TestBed, inject} from '@angular/core/testing';
import * as OT from '@opentok/client';

import {OpentokService} from './opentok.service';
const config = {
  SAMPLE_SERVER_BASE_URL: 'http://localhost:4200',
  API_KEY: '46746912',
  SESSION_ID:
    '1_MX40Njc0NjkxMn5-MTU5MDU3MTY1NzUwM35PWE9BRlplVUd4akRKaXpqVjNNVUNJeGJ-fg',
  TOKEN: 'abcdjksdhwiu',
};

describe('OpentokService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OpentokService],
    });
  });

  describe('service', () => {
    config.API_KEY = 'apiKey';
    config.SESSION_ID = 'sessionId';
    config.TOKEN = 'token';
    let service;
    beforeEach(inject([OpentokService], (s: OpentokService) => {
      service = s;
    }));

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('getOT() should return OT', () => {
      expect(service.getOT()).toEqual(OT);
    });

    describe('initSession()', () => {
      const mockOT = {
        initSession() {},
      };
      let session;

      beforeEach(() => {
        spyOn(service, 'getOT').and.returnValue(mockOT);
        session = jasmine.createSpyObj('session', ['connect', 'on']);
        spyOn(mockOT, 'initSession').and.returnValue(session);
      });

      it('should call OT.initSession', () => {
        service.initSession();
        expect(mockOT.initSession).toHaveBeenCalledWith(
          config.API_KEY,
          config.SESSION_ID,
        );
        expect(service.session).toEqual(session);
      });

      it('connect should call connect', () => {
        service.initSession();
        service.connect();
        expect(service.session.connect).toHaveBeenCalledWith(
          config.TOKEN,
          jasmine.any(Function),
        );
      });
    });
  });
});
