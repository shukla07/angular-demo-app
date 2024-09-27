import {Component, ViewEncapsulation} from '@angular/core';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {Location} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {AzureMsalFacadeService} from '@vmsl/shared/facades/azure-msal-facade.service';
import {environment} from '@vmsl/env/environment';
import {CalendarTenantConfig} from '../../profile/shared/models/tenant-calendar-config.model';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';

@Component({
  selector: 'vmsl-tenant-calendar-config',
  templateUrl: './tenant-calendar-config.component.html',
  styleUrls: ['./tenant-calendar-config.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TenantCalendarConfigComponent extends RouteComponentBase {
  tenantCalendarConfig = new CalendarTenantConfig();
  configExist = false;
  dialogName: string;
  loading = false;

  constructor(
    protected route: ActivatedRoute,
    protected location: Location,
    private readonly toastrService: ToastrService,
    private readonly azureMsalService: AzureMsalFacadeService,
    private readonly store: UserSessionStoreService,
  ) {
    super(route, location);
  }

  ngOnInit(): void {
    this.getAzureTenantConfig();
  }

  getAzureTenantConfig() {
    this.azureMsalService.getAzureTenantConfig().subscribe(config => {
      this.tenantCalendarConfig = config;
      if (this.tenantCalendarConfig.authClientId) {
        this.configExist = true;
        this.dialogName = 'Edit calendar config';
      } else {
        this.configExist = false;
        this.dialogName = 'Create new calendar config';
      }
    });
  }

  addEditCalendarTenantConfig(form) {
    if (form.invalid) {
      return;
    }
    this.loading = true;
    if (this.configExist) {
      this._subscriptions.push(
        this.azureMsalService
          .updateAzureTenantConfig(this.tenantCalendarConfig)
          .subscribe(
            resp => {
              if (resp['success']) {
                this.toastrService.success(
                  'Tenant calendar config updated successfully',
                  'SUCCESS',
                  {
                    timeOut: environment.messageTimeout,
                  },
                );
                this.store.removeCalTenantConfig();
                this.getAzureTenantConfig();
                form.form.markAsPristine();
                this.loading = false;
              } else {
                this.onClickCancel(form);
                this.toastrService.warning(
                  'Some error occured while updating the config',
                  'ERROR',
                  {
                    timeOut: environment.messageTimeout,
                  },
                );
                form.form.markAsPristine();
                this.loading = false;
              }
            },
            err => (this.loading = false),
          ),
      );
    } else {
      this._subscriptions.push(
        this.azureMsalService
          .createAzureTenantConfig(this.tenantCalendarConfig)
          .subscribe(
            res => {
              if (res['id']) {
                this.getAzureTenantConfig();
                this.toastrService.success(
                  'Tenant calendar config created successfully',
                  'SUCCESS',
                  {
                    timeOut: environment.messageTimeout,
                  },
                );
                this.loading = false;
              } else {
                this.onClickCancel(form);
                this.toastrService.warning(
                  'Some error occured while creating the config',
                  'ERROR',
                  {
                    timeOut: environment.messageTimeout,
                  },
                );
                this.loading = false;
              }
            },
            err => (this.loading = false),
          ),
      );
    }
  }

  onClickCancel(form) {
    if (this.configExist) {
      this.getAzureTenantConfig();
    } else {
      form.resetForm();
    }
  }
}
