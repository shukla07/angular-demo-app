import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {ApiService} from '@vmsl/core/api/api.service';
import {GetListAPICommand} from '@vmsl/core/api/commands';
import {environment} from '@vmsl/env/environment';

import {Role} from '../models/role.model';

export class GetRolesCommand extends GetListAPICommand<Role> {
  constructor(apiService: ApiService, adapter: IAdapter<Role>) {
    super(apiService, adapter, `${environment.userApiUrl}/roles`);
  }
}
