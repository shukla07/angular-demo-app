import {Injectable} from '@angular/core';
import {LoginModel} from '@vmsl/core/auth/models/login.model';
import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';

@Injectable()
export class LoginAdapter implements IAdapter<LoginModel> {
  adaptToModel(resp: any): any {
    return resp;
  }
  adaptFromModel(data: LoginModel): any {
    return {
      username: data.username,
      password: data.password,
      clientId: data.clientId,
      clientSecret: data.clientSecret,
    };
  }
}
