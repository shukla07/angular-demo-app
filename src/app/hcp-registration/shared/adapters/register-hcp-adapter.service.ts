import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {UserInfo} from '@vmsl/core/auth/models/user.model';

@Injectable()
export class RegisterHcpAdapter implements IAdapter<any> {
  constructor() {}
  adaptToModel(resp: any) {
    return resp;
  }
  adaptFromModel(data: Partial<UserInfo>) {
    const requestBody = {
      institute: data.institute,
      licenseNumber: data.licenseNumber,
      userDetails: {
        title: data.title,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.email,
        email: data.email,
        phone: data.phone,
      },
    };
    if (data.organisationId) {
      requestBody['organisationId'] = data.organisationId;
    }
    if (data.referralCode) {
      requestBody['referralCode'] = data.referralCode;
    }
    if (data.timeZone) {
      requestBody['timezone'] = data.timeZone;
    }
    return requestBody;
  }
}
