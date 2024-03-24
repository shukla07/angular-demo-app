import {Injectable} from '@angular/core';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {UserInfo} from '@vmsl/core/auth/models/user.model';

@Injectable()
export class UserListAdapter implements IAdapter<UserInfo> {
  adaptToModel(resp: any): UserInfo {
    const user = new UserInfo();
    user.firstName = resp.firstName;
    user.lastName = resp.lastName;
    user.role = resp.roleName;
    user.createdBy = resp.createdByName;
    user.id = resp.id;
    user.status = resp.status;
    user.createdOn = resp.createdOn;
    user.userTenantId = resp.userTenantId;
    user.locked = resp.userLocked;
    user.roleType = resp.roleType;
    user.teamNames = resp.teamNames;
    return user;
  }
  adaptFromModel(data: any): any {
    return data;
  }
}
