import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {JobTitle} from '../../main/job-titles-management/shared/models/job-titles-info.model';
import * as moment from 'moment';

@Injectable()
export class JobTitlesAdapter implements IAdapter<any> {
  adaptToModel(resp: any) {
    if (resp) {
      const title = new JobTitle();
      title.id = resp.id;
      title.createdByName = resp.createdByName;
      title.jobTitle = resp.jobTitle;
      title.description = resp.description;
      title.tenantId = resp.tenantId;
      title.status = resp.status;
      title.createdOn = moment(resp.createdOn).format('DD/MM/YYYY, HH:mm A');
      title.isModAllowed = resp.isModAllowed;
      return title;
    }
    return resp;
  }

  adaptFromModel(data: JobTitle) {
    return {
      id: data.id,
      jobTitle: data.jobTitle,
      description: data.description,
      status: data.status,
      isModAllowed: data.isModAllowed,
    };
  }
}
