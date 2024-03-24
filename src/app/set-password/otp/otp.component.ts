import {
  Component,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
} from '@angular/core';
import { RouteComponentBase } from '../../core/route-component-base';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { SetPasswordFacadeService } from '../set-password-facade.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '@vmsl/env/environment';
import { CountdownComponent } from 'ngx-countdown';
import { NgOtpInputComponent } from 'ng-otp-input/lib/components/ng-otp-input/ng-otp-input.component';
import { UserSessionStoreService } from '@vmsl/core/store/user-session-store.service';

@Component({
  selector: 'vmsl-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OtpComponent extends RouteComponentBase {
  reqOtpLoading = false;
  submitOtpLoading = false;
  reqOtpTemplate = true;
  token: string;
  user = {
    name: '',
    mobile: '',
    otp: '',
    isHcp: false,
    username: '',
  };
  resendLink: boolean;
  showTimer = false;
  @ViewChild('countDown', { static: false }) countdown: CountdownComponent;
  @ViewChild('ngOtpInput', { static: false }) ngOtpInput: NgOtpInputComponent;

  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly router: Router,
    protected readonly storeService: UserSessionStoreService,
    private readonly recaptchaV3Service: ReCaptchaV3Service,
    private readonly setPasswordService: SetPasswordFacadeService,
    private readonly toastrService: ToastrService,
    private readonly el: ElementRef,
  ) {
    super(route, location);
    this.token = this.getQueryParam('token');
    window.history.pushState({}, '', '/set-password/otp');
  }

  ngOnInit() {
    super.ngOnInit();
    if (!this.token) {
      this.toastrService.error(
        'Data lost due to page refreshed. Please use received link again and do not refresh the page',
        'Error',
      );
    } else {
      this.verifyLink();
      this._subscriptions.push(this.recaptchaV3Service.onExecute.subscribe());
    }
  }

  ngAfterViewChecked() {
    const elements = this.el.nativeElement as HTMLElement;
    const otpInput = elements.querySelectorAll('.otp-input');

    otpInput.forEach(element => {
      element.setAttribute('inputmode', 'numeric');
      element.setAttribute('autocomplete', 'one-time-code');
    });
  }

  verifyLink() {
    this._subscriptions.push(
      this.setPasswordService.verifyEmailLink(this.token).subscribe(res => {
        this.user.name = `${res['firstName']} ${res['lastName']}`;
        this.user.mobile = res.phone;
        this.user.isHcp = res.hcpUser;
        this.user.username = res.username;
      }),
    );
  }

  otpRequest() {
    this.resendLink = false;
    this.reqOtpLoading = true;
    if (this.countdown) {
      this.countdown.restart();
    }
    if (this.user.otp) {
      this.ngOtpInput.setValue(null);
      this.user.otp = '';
    }

    this._subscriptions.push(
      this.recaptchaV3Service.execute('resendOtp').subscribe(captchaToken => {
        if (this.user.isHcp) {
          this._subscriptions.push(
            this.setPasswordService
              .getOtpforHcpRegister(this.user.username, captchaToken)
              .subscribe(
                resp => {
                  this.showTimer = true;
                  this.toastrService.success(
                    'One-Time Passcode has been sent to your registered mobile number.',
                    'SUCCESS',
                    {
                      timeOut: environment.messageTimeout,
                    },
                  );
                  this.reqOtpTemplate = false;
                },
                err => {
                  this.reqOtpLoading = false;
                },
              ),
          );
        } else {
          this._subscriptions.push(
            this.setPasswordService
              .requestOtp(this.token, captchaToken)
              .subscribe(
                res => {
                  this.showTimer = true;
                  this.toastrService.success(
                    'One-Time Passcode has been sent to your registered mobile number.',
                    'SUCCESS',
                    {
                      timeOut: environment.messageTimeout,
                    },
                  );
                  this.reqOtpTemplate = false;
                },
                err => {
                  this.reqOtpLoading = false;
                },
              ),
          );
        }
      }),
    );
  }

  onSubmit(): void {
    this.submitOtpLoading = true;
    if (this.user.isHcp) {
      this._subscriptions.push(
        this.setPasswordService
          .submitOtpForHcp(this.user.username, this.user.otp)
          .subscribe(
            resp => {
              if (resp.accessToken && resp.refreshToken) {
                this.storeService.saveAccessToken(resp.accessToken);
                this.storeService.saveRefreshToken(resp.refreshToken);
                this.storeService.setPubnubSubsKey(resp.subscriptionKey);
                window.location.href = environment.homePath;
              }
            },
            err => {
              this.submitOtpLoading = false;
            },
          ),
      );
    } else {
      this._subscriptions.push(
        this.setPasswordService
          .submitOtpForSponsor(this.token, this.user.otp)
          .subscribe(
            () => {
              this.toastrService.success('One-Time Passcode Verified', 'SUCCESS', {
                timeOut: environment.messageTimeout,
              });
              this.router.navigate(['/set-password/password'], {
                queryParams: { token: this.token },
              });
            },
            err => {
              this.submitOtpLoading = false;
            },
          ),
      );
    }
  }

  stopTimer(timeLeft) {
    const resendOtpInterval = 270000;

    if (timeLeft.left === 0) {
      this.showTimer = false;
    }
    if (timeLeft.left === resendOtpInterval) {
      this.resendLink = true;
    }
  }

  onOtpChange(otp: string) {
    this.user.otp = otp;
  }

  cancel() {
    window.location.href = '/login';
  }
}
