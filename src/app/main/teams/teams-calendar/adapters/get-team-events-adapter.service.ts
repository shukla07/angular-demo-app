import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {SchedulerEvent} from '@sourcefuse/ngx-scheduler/lib/types';
import {Helper} from './../../../calendar/shared/utils';

@Injectable()
export class GetTeamEventsAdapter implements IAdapter<SchedulerEvent> {
  constructor(private readonly store: UserSessionStoreService) {}
  adaptToModel(resp: any): SchedulerEvent {
    return Helper.mapApiEventToSchedulerEvent(resp, this.store.getUser().id);
  }

  adaptFromModel(data: Object) {
    return data;
  }
}
