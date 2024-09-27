import {Injectable} from '@angular/core';
import {InMemoryStorageService} from 'ngx-webstorage-service';
import {cloneDeep} from 'lodash';
import {Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';

import {AnyAdapter} from '../api/adapters/any-adapter.service';
import {ApiService} from '../api/api.service';
import {RolesAdapter} from './adapters/roles-adapter.service';
import {GetRolesCommand} from './commands';
import {Role} from './models/role.model';
import {StoreKeys} from './store-keys.enum';
import {HttpParams} from '@angular/common/http';

@Injectable()
export class SystemStoreFacadeService {
  constructor(
    private readonly inMemoryStore: InMemoryStorageService,
    private readonly rolesAdapter: RolesAdapter,
    private readonly anyAdapter: AnyAdapter,
    private readonly apiService: ApiService,
  ) {}

  getRoles(): Observable<Role[]> {
    const rolesInStore = this.inMemoryStore.get(StoreKeys.ROLES);
    if (rolesInStore) {
      return of(cloneDeep(rolesInStore));
    } else {
      const command: GetRolesCommand = new GetRolesCommand(
        this.apiService,
        this.rolesAdapter,
      );
      let params = new HttpParams();
      const query = {
        order: 'name ASC',
      };
      params = params.set('filter', JSON.stringify(query));
      command.parameters = {
        query: params,
      };
      return command.execute().pipe(
        tap(roles => {
          this.inMemoryStore.set(StoreKeys.ROLES, cloneDeep(roles));
        }),
      );
    }
  }

  clearAll() {
    this.inMemoryStore.remove(StoreKeys.ROLES);
  }
}
