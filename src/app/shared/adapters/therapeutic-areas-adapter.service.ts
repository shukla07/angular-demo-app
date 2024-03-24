import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {TherapeuticArea} from '../../main/therapeutic-areas-management/shared/models/therapeutic-area-info.model.ts';
import * as moment from 'moment';

@Injectable()
export class TherapeuticAreasAdapter implements IAdapter<any> {
  adaptToModel(resp: any) {
    if (resp) {
      const therapeuticArea = new TherapeuticArea();
      therapeuticArea.id = resp.id;
      therapeuticArea.createdByName = resp.createdByName;
      therapeuticArea.name = resp.name;
      therapeuticArea.description = resp.description;
      therapeuticArea.tenantId = resp.tenantId;
      therapeuticArea.status = resp.status;
      therapeuticArea.createdOn = moment(resp.createdOn).format(
        'DD/MM/YYYY, HH:mm A',
      );
      return therapeuticArea;
    }
    return resp;
  }

  adaptFromModel(data: TherapeuticArea) {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      status: data.status,
    };
  }
}
