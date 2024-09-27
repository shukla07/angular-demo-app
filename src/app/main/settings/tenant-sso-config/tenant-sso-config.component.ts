import {Component} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Location} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {SettingsFacadeService} from '../shared/facade/settings-facade.service';

@Component({
  selector: 'vmsl-tenant-sso-config',
  templateUrl: './tenant-sso-config.component.html',
  styleUrls: ['./tenant-sso-config.component.scss'],
})
export class TenantSsoConfigComponent extends RouteComponentBase {
  isSsoAllowed: boolean;
  dialogName = 'Edit SSO Config';
  loading = false;
  configExist: boolean;
  msTenantId: string;
  constructor(
    protected route: ActivatedRoute,
    protected location: Location,
    private readonly store: UserSessionStoreService,
    private readonly settingsService: SettingsFacadeService,
  ) {
    super(route, location);
  }

  ngOnInit(): void {
    this.getTenantSsoConfig();
  }
  getTenantSsoConfig() {
    this.settingsService
      .getTenantSsoConfig(this.store.getUser().tenantId)
      .subscribe(resp => {
        this.isSsoAllowed = resp.isSsoAllowed;
        this.msTenantId = resp.msTenantId;
        if (resp.msTenantId) {
          this.configExist = true;
        }
      });
  }

  onClickCancel(form: NgForm) {
    if (this.configExist) {
      this.getTenantSsoConfig();
    } else {
      form.resetForm();
    }
  }

  editSsoConfig(form: NgForm) {
    this.settingsService
      .saveTenantSsoConfig(form.value, this.store.getUser().tenantId)
      .subscribe(resp => {
        if (resp.success) {
          this.getTenantSsoConfig();
        }
      });
  }
}
