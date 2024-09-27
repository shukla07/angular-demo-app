import {UserInfo} from '@vmsl/core/auth/models/user.model';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';

@Injectable()
export class HcpRequestListAdapter implements IAdapter<UserInfo> {
  adaptToModel(resp: any): UserInfo {
    if (resp) {
      const hcpInfo = new UserInfo();
      hcpInfo.firstName = resp.firstName;
      hcpInfo.lastName = resp.lastName;
      hcpInfo.roleName = resp.roleName;
      hcpInfo.referralStatus = resp.referralStatus;
      hcpInfo.id = resp.id;
      hcpInfo.email = resp.email;
      hcpInfo.phone = resp.phone;
      hcpInfo.referralCode = resp.referralCode;
      hcpInfo.licenseNumber = resp.licenseNumber;
      hcpInfo.referralName = resp.referralName;
      hcpInfo.referralRole = resp.referralRole;
      hcpInfo.referredBy = resp.referredBy;
      hcpInfo.institute = resp.institute;
      return hcpInfo;
    }
    return resp;
  }
  adaptFromModel(data: Partial<UserInfo>) {
    return data;
  }
}
