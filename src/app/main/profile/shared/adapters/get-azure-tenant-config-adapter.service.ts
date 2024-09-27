import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import { CalendarTenantConfig } from '../models/tenant-calendar-config.model';

@Injectable()
export class GetAzureTenantConfigAdapter
  implements IAdapter<CalendarTenantConfig> {
  adaptToModel(resp: any): CalendarTenantConfig {
    if (resp) {
      const calTenConfig = new CalendarTenantConfig();
      calTenConfig.authClientId = resp.auth_client_id;
      calTenConfig.authClientSecret = resp.auth_client_secret;
      calTenConfig.authUrl = resp.auth_url;
      calTenConfig.thumbprint = resp.thumbprint;
      calTenConfig.tokenUrl = resp.token_url;
      return calTenConfig;
    }
    return resp;
  }

  adaptFromModel(data: CalendarTenantConfig) {
    return data;
  }
}
