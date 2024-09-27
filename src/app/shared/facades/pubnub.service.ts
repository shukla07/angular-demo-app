import {Injectable} from '@angular/core';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {PubNubAngular} from 'pubnub-angular2';

@Injectable()
export class PubnubService {
  constructor(
    private readonly store: UserSessionStoreService,
    private readonly pubnub: PubNubAngular,
  ) {}

  removeCallTabIfNotBusy() {
    this.pubnub.getState(
      {
        uuid: this.store.getUser().id,
        channels: [this.store.getUser().tenantId],
      },
      (status, response) => {
        if (
          response.channels[this.store.getUser().tenantId].status !== 'Busy'
        ) {
          this.store.removeCallTab();
        }
      },
    );
  }
}
