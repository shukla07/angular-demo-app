import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {UserInfo as ScheduleUser} from '@sourcefuse/ngx-scheduler/lib/types';
import {UserInfo} from '@vmsl/core/auth/models/user.model';

@Injectable()
export class GetAddressBookUserAdapter implements IAdapter<ScheduleUser> {
  adaptToModel(resp: UserInfo): ScheduleUser {
    const obj = {
      id: resp.id,
      name: `${resp.firstName} ${resp.lastName}`,
      email: resp.email,
      username: resp.username,
      role: resp.roleName,
      photoUrl: resp.photoUrl,
      jobTitle: resp['jobTitleName'],
      userTitle: resp['jobTitleName'] || resp.roleName,
    };
    obj['title'] = resp.title;
    return obj;
  }

  adaptFromModel(data) {
    return data;
  }
}
