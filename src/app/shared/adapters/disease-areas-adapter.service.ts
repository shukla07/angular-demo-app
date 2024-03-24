import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {DiseaseArea} from '../../main/disease-areas/shared/models/disease-area-info.model';
import * as moment from 'moment';

@Injectable()
export class DiseaseAreasAdapter implements IAdapter<any> {
  adaptToModel(resp: any) {
    if (resp) {
      const diseaseArea = new DiseaseArea();
      diseaseArea.id = resp.id;
      diseaseArea.createdByName = resp.createdByName;
      diseaseArea.name = resp.name;
      diseaseArea.description = resp.description;
      diseaseArea.tenantId = resp.tenantId;
      diseaseArea.status = resp.status;
      diseaseArea.createdOn = moment(resp.createdOn).format(
        'DD/MM/YYYY, HH:mm A',
      );
      return diseaseArea;
    }
    return resp;
  }

  adaptFromModel(data: DiseaseArea) {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      status: data.status,
    };
  }
}
