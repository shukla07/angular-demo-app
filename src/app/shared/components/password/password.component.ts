import {Component, Output, EventEmitter, Input} from '@angular/core';
import {NgForm} from '@angular/forms';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';

@Component({
  selector: 'vmsl-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss'],
})
export class PasswordComponent extends RouteComponentBase {
  loading = false;
  user = {
    email: '',
    password: '',
    confirmPassword: '',
  };
  confirmPasswordError = false;

  @Output() submitPassword = new EventEmitter();
  @Input('button-disable') buttonDisable = false;

  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
  ) {
    super(route, location);
  }

  sendEmail(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    this.loading = true;
  }

  setPassword(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    this.submitPassword.emit(this.user);
  }

  navigateToSponsorLogin() {
    window.location.href = '/login';
  }

  matchPattern(confirmPassword:string) {
    if (this.user.password !== confirmPassword) {
      this.confirmPasswordError = true;
    }
     else if(confirmPassword.length)
      {
      this.confirmPasswordError = false;
      }
      else
      {
        //empty else is here
      }

  }
}
