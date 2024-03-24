import {Injectable} from '@angular/core';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Role} from '../models/role.model';

@Injectable()
export class RolesAdapter implements IAdapter<Role> {
  adaptToModel(resp: any): Role {
    const role: Role = new Role();
    if (resp) {
      role.id = resp.id;
      role.name = resp.name;
      role.permissions = resp.permissions;
      role.roleType = resp.roleType;
    }
    return role;
  }
  adaptFromModel(data: Role): any {
    return data;
  }
}
