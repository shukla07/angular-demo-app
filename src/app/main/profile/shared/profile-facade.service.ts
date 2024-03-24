import {HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AnyAdapter} from '@vmsl/core/api/adapters/any-adapter.service';
import {ApiService} from '@vmsl/core/api/api.service';
import {UserInfo} from '@vmsl/core/auth/models/user.model';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {environment} from '@vmsl/env/environment';
import {AddUserAdapter} from '@vmsl/shared/adapters/user-adapter.service';
import {GetOrgToSwitchCommand} from './commands/get-organisation.command';
import {GetOrgForHcpRegisterCommand} from './commands/get-orgs-hcp-register.command';
import {RegisterHcpInOtherOrgCommand} from './commands/register-hcp-in-new-org.command';
import {SwitchOrganisationsCommand} from './commands/switch-organisation.command';

@Injectable()
export class ProfileFacadeService {
  constructor(
    private readonly apiService: ApiService,
    private readonly anyAdapter: AnyAdapter,
    private readonly store: UserSessionStoreService,
    private readonly userAdapter: AddUserAdapter,
  ) {}

  getOrgToSwitch() {
    const command: GetOrgToSwitchCommand<Object> = new GetOrgToSwitchCommand(
      this.apiService,
      this.anyAdapter,
    );

    return command.execute();
  }

  switchOrg(tenantId: string) {
    const command: SwitchOrganisationsCommand<Object> = new SwitchOrganisationsCommand(
      this.apiService,
      this.anyAdapter,
      tenantId,
    );

    const headers = {
      ClientId: environment.clientId,
    };
    command.parameters = {
      headers: new HttpHeaders(headers),
    };

    return command.execute();
  }

  getOrgsForHcpRegister() {
    const command: GetOrgForHcpRegisterCommand<Object> = new GetOrgForHcpRegisterCommand(
      this.apiService,
      this.anyAdapter,
    );

    return command.execute();
  }

  registerHCP(user: UserInfo) {
    const command: RegisterHcpInOtherOrgCommand<Object> = new RegisterHcpInOtherOrgCommand(
      this.apiService,
      this.userAdapter,
      this.store.getUser().tenantId,
    );

    command.parameters = {
      data: user,
    };

    return command.execute();
  }
}
