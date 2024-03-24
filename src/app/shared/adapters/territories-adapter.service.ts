import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {Territory} from '../../main/territories-management/shared/models/territory-info.model';
import * as moment from 'moment';

@Injectable()
export class TerritoriesAdapter implements IAdapter<any> {
  adaptToModel(resp: any) {
    if (resp) {
      const territory = new Territory();
      territory.id = resp.id;
      territory.createdByName = resp.createdByName;
      territory.name = resp.name;
      territory.description = resp.description;
      territory.tenantId = resp.tenantId;
      territory.status = resp.status;
      territory.createdOn = moment(resp.createdOn).format(
        'DD/MM/YYYY, HH:mm A',
      );
      return territory;
    }
    return resp;
  }

  adaptFromModel(data: Territory) {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      status: data.status,
    };
  }
}
