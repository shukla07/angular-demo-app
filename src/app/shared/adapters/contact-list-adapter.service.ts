import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {UserInfo} from '@vmsl/core/auth/models/user.model';

@Injectable()
export class ContactListAdapter implements IAdapter<UserInfo> {
  adaptToModel(resp: any): UserInfo {
    const userInfo = new UserInfo();
    userInfo.role = resp.roleName;
    userInfo.firstName = resp.firstName;
    userInfo.lastName = resp.lastName;
    userInfo.photoUrl = resp.photoUrl;
    userInfo.slotAvailibility = resp.slotAvailibility;
    userInfo.id = resp.id;
    userInfo.email = resp.email;
    userInfo.userTenantId = resp.userTenantId;
    userInfo.state = 'offline';
    userInfo.favourite = false;
    userInfo.userVisibility = resp.UserVisibility;
    userInfo.userTitle = resp.jobTitleName || resp.roleName;
    userInfo.roleType = resp.roleType;
    return userInfo;
  }

  adaptFromModel(data: UserInfo) {
    return data;
  }
}
