import {Injectable} from '@angular/core';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {UserInfo} from '@vmsl/core/auth/models/user.model';

@Injectable()
export class AllUserAdapter implements IAdapter<UserInfo> {
  adaptToModel(resp: any) {
    const user = new UserInfo();
    user.firstName = resp.firstName;
    user.lastName = resp.lastName;
    user.id = resp.id;
    user.userTenantId = resp.userTenantId;
    user.userVisibility = resp.userVisibility;
    user.userTitle = resp.jobTitleName || resp.roleName;
    return user;
  }
  adaptFromModel(data: Partial<UserInfo>) {
    return data;
  }
}
