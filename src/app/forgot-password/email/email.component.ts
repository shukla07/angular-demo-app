import {Component, ViewEncapsulation} from '@angular/core';
import {NgForm} from '@angular/forms';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {ToastrService} from 'ngx-toastr';
import {environment} from '@vmsl/env/environment';
import {ForgotPasswordService} from '../forgot-password.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';

@Component({
  selector: 'vmsl-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EmailPasswordComponent extends RouteComponentBase {
  loading = false;
  user = {
    email: '',
  };

  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly forgotPasswordService: ForgotPasswordService,
    private readonly toastrService: ToastrService,
    private readonly storeService: UserSessionStoreService,
  ) {
    super(route, location);
    this.user.email = this.storeService.getUserEmail();
  }

  sendLinkToEmail(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    this.loading = true;
    this._subscriptions.push(
      this.forgotPasswordService.forgotPassword(this.user.email).subscribe(
        resp => {
          if (resp.message) {
            this.toastrService.info(resp.message, 'Attention', {
              timeOut: environment.messageTimeout,
            });
          }
          this.loading = false;
          form.reset();
        },
        error => {
          this.loading = false;
          form.reset();
        },
      ),
    );
  }

  navigateToSponsorLogin() {
    window.location.href = '/login';
  }
}
