import {Injectable} from '@angular/core';

import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {UserInfo} from '../models/user.model';
@Injectable()
export class CurrentUserAdapter implements IAdapter<UserInfo> {
  constructor() {}

  adaptToModel(resp: any): UserInfo {
    const user: UserInfo = new UserInfo();
    if (resp) {
      user.id = resp.id;
      user.firstName = resp.firstName;
      user.lastName = resp.lastName;
      user.username = resp.username;
      user.email = resp.email;
      user.phone = resp.phone;
      user.role = resp.role;
      user.permissions = resp.permissions;
      user.tenantId = resp.tenantId;
      user.userTenantId = resp.userTenantId;
      user.title = resp.title;
      user.photoUrl = resp.imageKey;
    }
    return user;
  }
  adaptFromModel(data: UserInfo): any {
    return data;
  }
}
