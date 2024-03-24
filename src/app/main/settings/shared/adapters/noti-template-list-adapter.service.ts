import {Injectable} from '@angular/core';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Notification} from '../models/notification.model';

@Injectable()
export class NotiTemplateListAdapter implements IAdapter<Notification> {
  adaptToModel(resp: any): Notification {
    return resp;
  }
  adaptFromModel(data: any): any {
    return data;
  }
}
