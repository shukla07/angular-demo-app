import {Component, ViewEncapsulation, ViewChild} from '@angular/core';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {NgForm} from '@angular/forms';
import {UserInfo} from '@vmsl/core/auth/models/user.model';
import {HcpFacadeService} from '../shared/facades/hcp-facade.service';
import {ToastrService} from 'ngx-toastr';
import {environment} from '@vmsl/env/environment';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {TenantsModel} from '../shared/models/tenants.model';
import {timezones} from '../../../assets/array/timezones';

@Component({
  selector: 'vmsl-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class RegistrationComponent extends RouteComponentBase {
  title = 'Healthcare Professional Registration';
  user = new UserInfo();
  regByOrg = false;
  referCode: string;
  tenants: TenantsModel[];
  loading = false;
  timeZoneList = timezones;
  @ViewChild('phone', {static: false}) phone;
  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly hcpFacadeService: HcpFacadeService,
    private readonly tostrService: ToastrService,
    private readonly router: Router,
    private readonly store: UserSessionStoreService,
  ) {
    super(route, location);
  }

  ngOnInit(): void {
    this.referCode = this.getQueryParam('referCode');
    window.history.pushState({}, '', '/hcp/register');
    if (this.referCode) {
      this.regByOrg = false;
      this.user.referralCode = this.referCode;
    }
  }

  registerHcp(form: NgForm) {
    if (form.form.controls['phone'].errors) {
      form.form.controls['phone'].markAsTouched();
    }
    if (form.invalid) {
      if (form.form.controls['tenants']) {
        form.form.controls['tenants'].markAsTouched();
      }
      return;
    }
    this.loading = true;
    this._subscriptions.push(
      this.hcpFacadeService.registerHcp(this.user).subscribe(
        resp => {
          if (resp['success']) {
            this.tostrService.success('Registration Completed', null, {
              timeOut: environment.messageTimeout,
            });
            this.store.setUserEmail(this.user.email);
            this.loading = false;
            this.router.navigate(['/hcp/login']);
          }
        },
        err => {
          this.loading = false;
        },
      ),
    );
  }

  cancel(form) {
    if (this.referCode) {
      this.referCode = null;
    }
    this.phone.phoneNumber = '';
    form.resetForm();
  }

  navigateToHcpLogin() {
    this.router.navigate(['/hcp/login']);
  }

  getOrganisations() {
    this._subscriptions.push(
      this.hcpFacadeService.getTenantsList().subscribe(resp => {
        this.tenants = resp;
      }),
    );
  }

  onOptionChange(regByOrg) {
    if (regByOrg.value) {
      this.user.referralCode = null;
    } else {
      this.user.organisationId = null;
    }
  }
}
