import {Component, ViewEncapsulation} from '@angular/core';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {Location} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {ForgotPasswordService} from '../forgot-password.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'vmsl-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SetPasswordComponent extends RouteComponentBase {
  user: Object;
  token: string;

  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly forgotPasswordService: ForgotPasswordService,
    private readonly store: UserSessionStoreService,
    private readonly toastrService: ToastrService,
  ) {
    super(route, location);
  }

  ngOnInit() {
    super.ngOnInit();
    this.token = this.getQueryParam('token');
    window.history.pushState({}, '', '/forgot-password/password');
    if (!this.token) {
      this.toastrService.error(
        'Data lost due to page refreshed. Please use received link again and do not refresh the page',
        'Error',
      );
    }
  }

  setPassword(data) {
    this._subscriptions.push(
      this.forgotPasswordService
        .setPassword(data.password, this.token)
        .subscribe(resp => {
          if (resp.authClientIds) {
            this.store.setMessage('savedPassword');
            window.location.href = '/login';
          }
        }),
    );
  }

  navigateToSponsorLogin() {
    window.location.href = '/login';
  }
}
