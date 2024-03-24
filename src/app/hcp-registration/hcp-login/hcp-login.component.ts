import {
  Component,
  ViewChild,
  ViewEncapsulation,
  ElementRef,
  TemplateRef,
} from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {HcpFacadeService} from '../shared/facades/hcp-facade.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {ToastrService} from 'ngx-toastr';
import {environment} from '@vmsl/env/environment';
import {CountdownComponent} from 'ngx-countdown';
import {NgOtpInputComponent} from 'ng-otp-input/lib/components/ng-otp-input/ng-otp-input.component';
import {ReCaptchaV3Service} from 'ng-recaptcha';
import {NbDialogModule} from '@nebular/theme/components/dialog/dialog.module';
import {NbDialogService} from '@nebular/theme';
import * as OT from '@opentok/client';
import {deviceIncompatible} from '../../../assets/message/notification';

@Component({
  selector: 'vmsl-hcp-login',
  templateUrl: './hcp-login.component.html',
  styleUrls: ['./hcp-login.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HcpLoginComponent extends RouteComponentBase {
  loading = false;
  loginTemplate = true;
  otp = '';
  user = {
    email: '',
  };
  otpLoading = false;
  resendLink: boolean;
  showTimer = false;
  lastRoute: string;
  @ViewChild('countDown', {static: false}) countdown: CountdownComponent;
  @ViewChild('ngOtpInput', {static: false}) ngOtpInput: NgOtpInputComponent;
  @ViewChild('dialog', {read: TemplateRef}) dialog: TemplateRef<NbDialogModule>;

  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly hcpFacadeService: HcpFacadeService,
    private readonly store: UserSessionStoreService,
    private readonly toastr: ToastrService,
    private readonly router: Router,
    private readonly recaptchaV3Service: ReCaptchaV3Service,
    private readonly el: ElementRef,
    private readonly dialogService: NbDialogService,
  ) {
    super(route, location);
  }

  ngOnInit() {
    super.ngOnInit();
    this.user.email = this.store.getUserEmail();
    this.lastRoute = this.store.getLastRoute();
    if (this.user.email) {
      this.sendOtpToUser();
    }
    if (!OT.checkSystemRequirements()) {
      this.toastr.warning(deviceIncompatible, 'Incompatible Browser', {
        timeOut: environment.messageTimeout,
      });
    }
  }

  ngAfterViewInit() {
    if (this.store.getMessage() === 'sessionExpire') {
      this.store.removeMessage();
      this.dialogService.open(this.dialog);
    }
  }

  ngAfterViewChecked() {
    const elements = this.el.nativeElement as HTMLElement;
    const otpInput = elements.querySelectorAll('.otp-input');

    otpInput.forEach(element => {
      element.setAttribute('inputmode', 'numeric');
      element.setAttribute('autocomplete','one-time-code');
    });
  }

  sendOtpToUser() {
    const audio = new Audio('../../assets/audio/login-sound.wav');
    audio.volume = 0.1;
    audio.play();
    this.checkLastLogin();
    this.resendLink = false;
    if (this.ngOtpInput) {
      this.ngOtpInput.setValue(null);
      this.otp = '';
    }
    if (this.countdown) {
      this.countdown.restart();
    }
    if (!this.user.email) {
      return;
    }
    this.loading = true;
    this._subscriptions.push(
      this.recaptchaV3Service.execute('sendOtp').subscribe(captchaToken => {
        this._subscriptions.push(
          this.hcpFacadeService
            .getOtpforHcpLogin(this.user.email, captchaToken)
            .subscribe(
              resp => {
                if (resp['success']) {
                  this.loginTemplate = false;
                  this.showTimer = true;
                  this.loading = false;
                  this.toastr.info(
                    'One-Time Passcode has been sent to your registered mobile number.',
                    null,
                    {
                      timeOut: environment.messageTimeout,
                    },
                  );
                }
              },
              err => {
                this.loading = false;
              },
            ),
        );
      }),
    );
  }

  checkLastLogin() {
    if (this.store.getAccessToken()) {
      this.store.clearAll();
    }
  }

  authorizeHcp() {
    this.otpLoading = true;
    this._subscriptions.push(
      this.hcpFacadeService.authorizeHcp(this.user.email, this.otp).subscribe(
        resp => {
          if (resp.accessToken && resp.refreshToken) {
            this.store.saveAccessToken(resp.accessToken);
            this.store.saveRefreshToken(resp.refreshToken);
            this.store.setPubnubSubsKey(resp.subscriptionKey);
            this.store.setJrHcpLogin(true);
            if (this.lastRoute) {
              window.location.href = this.lastRoute;
            } else {
              window.location.href = environment.homePath;
            }
          }
        },
        err => {
          this.otpLoading = false;
        },
      ),
    );
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
    this.otp = otp;
  }

  navigateToRegister() {
    this.router.navigate(['/hcp/register']);
  }
  navigateTosponsorLogin() {
    window.location.href = '/login';
  }
}
