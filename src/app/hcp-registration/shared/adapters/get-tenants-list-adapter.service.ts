import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {TenantsModel} from '../models/tenants.model';

@Injectable()
export class GetTenantsListAdapter implements IAdapter<any> {
  adaptToModel(resp: any) {
    if (resp) {
      const tenantInfo = new TenantsModel();
      tenantInfo.id = resp.id;
      tenantInfo.key = resp.key;
      tenantInfo.name = resp.name;
      tenantInfo.status = resp.status;
      return tenantInfo;
    }
    return resp;
  }
  adaptFromModel(data: Partial<TenantsModel>) {
    return data;
  }
}
