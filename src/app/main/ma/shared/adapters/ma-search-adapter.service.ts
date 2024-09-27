import {Injectable} from '@angular/core';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {MALink} from '../../ma-link/ma-link.model';

@Injectable()
export class MaSearchAdapter implements IAdapter<MALink> {
  adaptToModel(resp: any) {
    const maLink = new MALink();
    maLink.totalFMD = resp.totalCount;
    maLink.activeFMD = resp.onlineCount;
    maLink.activeFMDList = resp.users;
    return maLink;
  }
  adaptFromModel(data: Partial<any>) {
    return {
      diseaseDivision: data.diseaseArea.map(ele => ele.id),
      therapeuticDivision: data.therapeuticArea.map(ele => ele.id),
      territoryDivision: data.territory.map(ele => ele.id),
      jobTitle: data.jobTitle.map(ele => ele.id),
    };
  }
}
