import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';

@Injectable()
export class GetTeamMembersAdapter implements IAdapter<any> {
  constructor(private readonly store: UserSessionStoreService) {}
  adaptToModel(resp: any): any {
    const roleType = 7; // because we are not showing hcp in the team allocation view
    const users = [];
    if (resp.users) {
      resp.users.forEach(user => {
        if (user.role_type !== roleType) {
          const userModel = {
            id: user.user_id,
            role: user.role_name,
            name: user.user_name,
          };
          users.push(userModel);
        }
      });
    }
    return users;
  }

  adaptFromModel(data: Object) {
    return data;
  }
}
