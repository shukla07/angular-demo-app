import {Injectable} from '@angular/core';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {UserInfo} from '@vmsl/core/auth/models/user.model';

@Injectable()
export class UserNameAdapter implements IAdapter<UserInfo> {
  adaptToModel(resp: any): UserInfo {
    const user = new UserInfo();
    user.firstName = resp.firstName;
    user.lastName = resp.lastName;
    user.id = resp.id;
    user.photoUrl = resp.photoUrl || 'assets/avatar.png';
    user.role = resp.roleName;
    return user;
  }
  adaptFromModel(data: any): any {
    return data;
  }
}
