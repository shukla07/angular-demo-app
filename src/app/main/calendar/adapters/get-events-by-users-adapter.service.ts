import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {Helper} from '../shared/utils';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';

@Injectable()
export class GetEventsByUsersAdapter implements IAdapter<any> {
  constructor(private readonly store: UserSessionStoreService) {}
  adaptToModel(events: any): any {
    if (!events?.length) {
      return [];
    }
    return events.map(resp =>
      Helper.mapApiEventToSchedulerEvent(resp, this.store.getUser().id),
    );
  }

  adaptFromModel(data: string[]) {
    let obj = {};
    if (data.includes('allocationView')) {
      data.pop();
      obj = {identifiers: data, allocationView: true};
    } else {
      obj = {identifiers: data};
    }
    return (obj);
  }
}
