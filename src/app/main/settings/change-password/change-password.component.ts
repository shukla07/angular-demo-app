import {Component, ViewEncapsulation} from '@angular/core';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {SettingsFacadeService} from '../shared/facade/settings-facade.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {ToastrService} from 'ngx-toastr';
import {environment} from '@vmsl/env/environment';

@Component({
  selector: 'vsml-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChangePasswordComponent extends RouteComponentBase {
  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly settingsService: SettingsFacadeService,
    private readonly store: UserSessionStoreService,
    private readonly toastr: ToastrService,
  ) {
    super(route, location);
    this.user.email = this.store.getUser().username;
  }
  loading = false;
  user = {
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
  confirmPasswordError = false;

  onInputChange(form) {
    if (
      form.form.controls['crntPassword'].value ===
      form.form.controls['newPassword'].value
    ) {
      form.form.controls['newPassword'].setErrors({invalid: true});
    }
  }

  matchPattern(confirmPassword: string, form) {
    if (this.user.newPassword !== confirmPassword) {
      this.confirmPasswordError = true;
    } else {
      this.confirmPasswordError = false;
    }
  }

  resetPassword(form) {
    if (form.invalid) {
      return;
    }
    this.loading = true;
    this._subscriptions.push(
      this.settingsService.resetPassword(this.user).subscribe(
        resp => {
          if (resp.success) {
            this.toastr.success('Password has been reset successfully.', '', {
              timeOut: environment.messageTimeout,
            });
            this.loading = false;
            form.reset();
          }
        },
        err => {
          this.loading = false;
        },
      ),
    );
  }
}
